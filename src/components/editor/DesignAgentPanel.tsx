import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  AtSign,
  HelpCircle,
  Settings2,
  Share2,
  FolderOpen,
  Wand2,
  ChevronLeft,
  ChevronDown,
  X,
} from 'lucide-react';
import { Message, Suggestion } from '@/types/editor';

interface DesignAgentPanelProps {
  messages: Message[];
  suggestions: Suggestion[];
  onSendMessage: (message: string) => void;
  userName: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  agentName?: string;
  modelName?: string;
}

const DesignAgentPanel: React.FC<DesignAgentPanelProps> = ({
  messages,
  suggestions,
  onSendMessage,
  userName,
  isCollapsed,
  onToggleCollapse,
  agentName = 'CORA',
  modelName = 'Nano Banana',
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-800 p-2 rounded-r-lg text-slate-400 hover:text-white transition-colors z-20"
      >
        <ChevronLeft className="w-4 h-4 rotate-180" />
      </button>
    );
  }

  return (
    <div className="w-[340px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200 tracking-wide">
            DESIGN AGENT: {agentName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <Settings2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <FolderOpen className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <Wand2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.role === 'assistant' && !message.isRequest && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-700">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Hi {userName}</p>
                  <p className="text-sm text-slate-400 whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            )}
            {message.isRequest && (
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700/50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 bg-violet-500/20 rounded text-violet-400 font-medium">
                    Request
                  </span>
                </div>
                <p className="text-sm text-slate-300">{message.content}</p>
                {message.image && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-700">
                    <img src={message.image} alt="Design" className="w-full h-auto" />
                    <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded-md flex items-center justify-center shadow-md">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
                    </div>
                  </div>
                )}
              </div>
            )}
            {message.role === 'user' && !message.isRequest && (
              <div className="flex justify-end">
                <div className="bg-violet-500/20 rounded-xl px-4 py-2 max-w-[80%]">
                  <p className="text-sm text-slate-200">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3 pt-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full flex items-center gap-3 p-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-slate-700/50"
              >
                <img
                  src={suggestion.thumbnail}
                  alt={suggestion.title}
                  className="w-20 h-14 rounded-lg object-cover bg-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{suggestion.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Switch Option */}
        <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors group">
          <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-slate-400 transition-colors" />
          <span>Switch</span>
        </button>

        <div ref={messagesEndRef} />
      </div>

      {/* Promo Banner */}
      <div className="mx-4 mb-2">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🎁</span>
            <span className="text-sm text-amber-200 font-medium">Get 365 days of FREE Nano Banana Pro!</span>
          </div>
          <button className="text-amber-400/60 hover:text-amber-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
          <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </span>
          <span>{agentName} is waiting for your response...</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Start with an idea, or type "@" to mention'
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-3 px-4 pr-28 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <AtSign className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className={`p-2 rounded-lg transition-all ${
                  inputValue.trim()
                    ? 'text-teal-400 hover:text-teal-300 hover:bg-teal-500/20'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="font-medium">{modelName}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignAgentPanel;
