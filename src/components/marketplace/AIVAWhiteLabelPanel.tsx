import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, Loader2, MessageSquare, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';

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

// Suggestions for white-label configuration
const AIVA_SUGGESTIONS = [
  'Help me set up my brand colors',
  'Suggest pricing for my target market',
  'Write a compelling tagline for my app',
  'What domain name should I use?',
  'How do I attract my first customers?',
  'Help me create marketing copy',
];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm AIVA, your white-label configuration assistant. I'm here to help you set up and customize **${app.name}** for your brand.\n\nI can help you with:\n- **Brand Setup**: Logo, colors, and app name\n- **Pricing Strategy**: Setting competitive prices\n- **Marketing Copy**: Headlines and descriptions\n- **Domain Configuration**: Choosing the right subdomain\n\nWhat would you like to start with?`
      }]);
    }
  }, [isOpen, app.name]);

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

Be friendly, helpful, and provide specific, actionable advice. Use markdown formatting for lists and emphasis.

If suggesting a specific configuration change, format it clearly so the user knows exactly what to do.`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/aiva-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || SUPABASE_KEY}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          context: '/app-license',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'I apologize, but I encountered an error. Please try again.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AIVA error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
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

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('- ')) {
        return <div key={i} className="flex gap-2 ml-2"><span>•</span><span dangerouslySetInnerHTML={{ __html: line.substring(2) }} /></div>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  if (!isOpen) return null;

  // Calculate left position based on sidebar state
  const leftPosition = sidebarCollapsed ? 'left-16' : 'left-64';

  return (
    <div className={`fixed ${leftPosition} top-0 bottom-0 w-[400px] bg-background border-r border-border shadow-xl z-40 flex flex-col transition-all duration-300 animate-in slide-in-from-left`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-violet-500/10 to-indigo-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AIVA</h3>
            <p className="text-xs text-muted-foreground">White-Label Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {AIVA_SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AIVA for help..."
            className="flex-1 resize-none bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-auto"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
