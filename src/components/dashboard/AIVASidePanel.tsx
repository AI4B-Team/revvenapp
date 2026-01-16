import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, SlidersHorizontal, Maximize2, Minimize2, Mic, Plus, Send, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIVASidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarCollapsed?: boolean;
}

// App-specific suggestions
const appSuggestions: Record<string, { title: string; suggestions: string[] }> = {
  '/create': {
    title: 'Create Studio',
    suggestions: [
      'Generate a product photo with studio lighting',
      'Create a social media carousel for my brand',
      'Help me write a caption for Instagram',
      'Upscale and enhance my image quality',
    ],
  },
  '/edit': {
    title: 'Video Editor',
    suggestions: [
      'Add captions to my video automatically',
      'Suggest background music for this clip',
      'Help me trim and arrange my scenes',
      'Create a thumbnail for my video',
    ],
  },
  '/transcribe': {
    title: 'Transcribe',
    suggestions: [
      'Transcribe this audio file accurately',
      'Identify different speakers in the recording',
      'Generate a summary of the transcript',
      'Export transcript to different formats',
    ],
  },
  '/blog-writer': {
    title: 'Blog Writer',
    suggestions: [
      'Help me outline a blog post about...',
      'Suggest SEO keywords for my article',
      'Write an engaging introduction',
      'Generate meta description for this post',
    ],
  },
  '/voiceovers': {
    title: 'Voiceovers',
    suggestions: [
      'Generate a professional voiceover',
      'Clone my voice for future use',
      'Add background music to narration',
      'Translate voiceover to another language',
    ],
  },
  default: {
    title: 'AIVA Assistant',
    suggestions: [
      'Help me create engaging content',
      'Generate images for my project',
      'Write copy for my brand',
      'Suggest creative ideas',
    ],
  },
};

const AIVASidePanel = ({ isOpen, onClose, sidebarCollapsed = false }: AIVASidePanelProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Get suggestions based on current app
  const currentPath = location.pathname;
  const appConfig = appSuggestions[currentPath] || appSuggestions.default;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      // Get auth token for the request
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use direct fetch for streaming support
      const response = await fetch(`${SUPABASE_URL}/functions/v1/aiva-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: currentPath,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
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
      console.error('AIVA chat error:', error);
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: 'Sorry, I encountered an error. Please try again.' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Calculate left position based on sidebar state
  const leftPosition = sidebarCollapsed ? 'left-16' : 'left-64';

  return (
    <div 
      className={`fixed ${leftPosition} top-0 h-full bg-background border-r border-border shadow-xl z-40 flex flex-col transition-all duration-300 ${
        isOpen 
          ? (isExpanded ? 'w-[600px] translate-x-0' : 'w-[400px] translate-x-0')
          : 'w-0 -translate-x-full'
      }`}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-muted transition border border-border bg-muted/50">
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
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="flex items-center gap-1 mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">How Can I Help?</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    I'm here to help you with {appConfig.title}
                  </p>
                  
                  {/* Suggestions */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2 justify-center">
                      <Sparkles size={12} />
                      Suggestions
                    </p>
                    {appConfig.suggestions.slice(0, 4).map((suggestion, index) => (
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
                        {msg.content || (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-sm opacity-70">Thinking...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="border-2 border-brand-green rounded-xl p-3">
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
                  <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition">
                    <Plus size={16} className="text-muted-foreground" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition text-sm text-muted-foreground">
                    <SlidersHorizontal size={14} />
                    Tools
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-muted transition">
                    <Mic size={18} className="text-muted-foreground" />
                  </button>
                  <button 
                    onClick={handleSend}
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
        </>
      )}
    </div>
  );
};

export default AIVASidePanel;
