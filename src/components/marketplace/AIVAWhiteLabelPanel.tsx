import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, Loader2, MessageSquare, Trash2, History, SlidersHorizontal, Maximize2, Minimize2, Mic, MicOff, SquarePen, ArrowLeft, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIVAWhiteLabelPanelProps {
  isOpen: boolean;
  onClose: () => void;
  app: MarketplaceApp;
  license?: AppLicense;
  onApplySuggestion?: (type: string, value: any) => void;
  sidebarCollapsed?: boolean;
}

// Simple markdown renderer for chat messages
const renderMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    const processInline = (str: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = str;
      let keyIndex = 0;
      
      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.substring(0, boldMatch.index));
          }
          parts.push(<strong key={`bold-${keyIndex++}`}>{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
          continue;
        }
        parts.push(remaining);
        break;
      }
      
      return parts;
    };
    
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.substring(2);
      elements.push(
        <div key={lineIndex} className="flex gap-2 ml-2">
          <span className="text-muted-foreground">•</span>
          <span>{processInline(content)}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={lineIndex} className="h-2" />);
    } else {
      elements.push(
        <div key={lineIndex}>{processInline(line)}</div>
      );
    }
  });
  
  return <div className="space-y-1 text-sm whitespace-pre-wrap">{elements}</div>;
};

export function AIVAWhiteLabelPanel({
  isOpen,
  onClose,
  app,
  license,
  onApplySuggestion,
  sidebarCollapsed = false
}: AIVAWhiteLabelPanelProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Speech recognition
  const handleSpeechResult = useCallback((transcript: string) => {
    setMessage(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
  });

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening(message);
    }
  }, [isListening, startListening, stopListening, message]);

  // Suggestions for white-label configuration
  const AIVA_SUGGESTIONS = [
    'Help me set up my brand colors',
    'Suggest pricing for my target market',
    'Write a compelling tagline for my app',
    'What domain name should I use?',
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const systemPrompt = `You are AIVA, an expert white-label configuration assistant for the REVVEN platform. You help users set up and customize apps to resell under their own brand.

Current App: ${app.name}
App Description: ${app.description}
App Features: ${app.features.join(', ')}
Category: ${app.category}
${license ? `
Current Brand Settings:
- App Name: ${license.brandSettings.appName || 'Not set'}
- Primary Color: ${license.brandSettings.primaryColor || 'Not set'}
- Subdomain: ${license.domainSettings.subdomain || 'Not set'}
- Pricing: $${license.pricingSettings.monthlyPrice}/month
` : 'No license activated yet.'}

Your role:
1. Help users configure their white-label settings
2. Suggest brand colors, names, and pricing strategies
3. Provide marketing tips and copy suggestions
4. Guide them through the setup process
5. Answer questions about reselling and customization

Be friendly, helpful, and provide specific, actionable advice. Use markdown formatting for lists and emphasis.`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/aiva-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          context: '/app-license',
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('AIVA error:', error);
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: 'I apologize, but I encountered an error. Please try again.' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [message, messages, isLoading, app, license]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  // Calculate left position based on sidebar state
  const leftPosition = sidebarCollapsed ? 'left-16' : 'left-64';

  return (
    <div 
      className={`fixed ${leftPosition} top-0 h-full bg-background border-r border-border shadow-xl z-40 flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-[600px]' : 'w-[400px]'
      } animate-in slide-in-from-left`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-lg border border-border bg-muted/50">
                  <MessageSquare size={18} className="text-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setMessages([])}
                  className="p-2 rounded-lg hover:bg-muted transition"
                >
                  <SquarePen size={18} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleClearChat}
                  className="p-2 rounded-lg hover:bg-muted transition"
                >
                  <Trash2 size={18} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Chat</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-muted transition">
                  <History size={18} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat History</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-muted transition">
                  <SlidersHorizontal size={18} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-muted transition"
                >
                  {isExpanded ? (
                    <Minimize2 size={18} className="text-muted-foreground" />
                  ) : (
                    <Maximize2 size={18} className="text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? 'Minimize' : 'Expand'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* Empty State - Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="flex items-center gap-1 mb-4">
                <div className="w-2 h-2 rounded-full bg-brand-green" />
                <div className="w-2 h-2 rounded-full bg-brand-green" />
                <div className="w-2 h-2 rounded-full bg-brand-green" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">How Can I Help?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                I'm here to help you set up and customize <strong>{app.name}</strong> for your brand.
              </p>
              
              {/* What I can help with */}
              <div className="text-left w-full mb-6 p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-sm text-foreground mb-3">I can help you with:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span>•</span>
                    <span><strong className="text-foreground">Brand Setup</strong>: Logo, colors, and app name</span>
                  </div>
                  <div className="flex gap-2">
                    <span>•</span>
                    <span><strong className="text-foreground">Pricing Strategy</strong>: Setting competitive prices</span>
                  </div>
                  <div className="flex gap-2">
                    <span>•</span>
                    <span><strong className="text-foreground">Marketing Copy</strong>: Headlines and descriptions</span>
                  </div>
                  <div className="flex gap-2">
                    <span>•</span>
                    <span><strong className="text-foreground">Domain Configuration</strong>: Choosing the right subdomain</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Suggestions */}
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2 justify-center">
                  <Sparkles size={12} />
                  Quick Suggestions
                </p>
                {AIVA_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-brand-green/30 transition text-sm text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-brand-green text-white rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' 
                        ? renderMarkdown(msg.content)
                        : <span className="text-sm">{msg.content}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-sm opacity-70">Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="border-2 border-border rounded-xl p-3">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AIVA Anything"
            disabled={isLoading}
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-3 disabled:opacity-50"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted hover:border-brand-green/50 transition text-sm text-muted-foreground">
                <SlidersHorizontal size={14} />
                Tools
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {isSupported && (
                <button 
                  onClick={handleMicClick}
                  className={`p-2 rounded-lg transition ${
                    isListening 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'hover:bg-muted'
                  }`}
                >
                  {isListening ? (
                    <MicOff size={18} className="text-red-500 animate-pulse" />
                  ) : (
                    <Mic size={18} className="text-muted-foreground" />
                  )}
                </button>
              )}
              <button 
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="p-2 rounded-full bg-brand-green/20 hover:bg-brand-green/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={18} className="text-brand-green animate-spin" />
                ) : (
                  <Send size={18} className="text-brand-green" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
