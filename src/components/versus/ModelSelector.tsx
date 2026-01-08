import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Brain, Gauge } from 'lucide-react';
import { AIModel } from './types';
import { AI_PROVIDERS, AI_MODELS, getModelById, getProviderById } from './data';

interface ModelSelectorProps {
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelect,
  isOpen,
  onToggle,
  onClose,
  compact = false
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

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'fast': return <Zap className="w-3 h-3 text-amber-500" />;
      case 'balanced': return <Gauge className="w-3 h-3 text-blue-500" />;
      case 'deep': return <Brain className="w-3 h-3 text-purple-500" />;
      default: return null;
    }
  };

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
        {!compact && (
          <span className="text-sm font-medium text-foreground">
            {selectedModelProvider?.name}: {selectedModel?.displayName}
          </span>
        )}
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
                      <div className="flex items-center gap-2">
                        {getTierIcon(model.tier)}
                        <p className={`text-sm font-medium ${model.id === selectedModelId ? 'text-primary' : 'text-foreground'}`}>
                          {model.displayName}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {model.supportsVision && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
                            vision
                          </span>
                        )}
                        {model.capabilities.slice(0, 1).map(cap => (
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

export default ModelSelector;
