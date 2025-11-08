import { useState, useEffect } from 'react';
import { Plus, Network, Mic, ArrowUp, Search, Sparkles, ChevronDown, Send } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Assistant = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [selectedModel, setSelectedModel] = useState('All-Purpose (GPT-5)');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [conversations, setConversations] = useState([
    { id: 1, title: 'what are the top LLMs?', date: 'Today' }
  ]);

  const models = [
    'All-Purpose (GPT-5)',
    'Real Time Search (Grok 4 Fast)',
    'Creative (Claude Sonnet 4.5)',
    'Thinking Model (Gemini 2.5 Pro)'
  ];

  const prompts = [
    'Create a character',
    'Design a logo',
    'Make a flyer',
    'Edit a photo',
    'Upscale an image',
    'Write an eBook',
    'Generate a video',
    'Compose music',
    'Write blog content',
    'Create social media posts'
  ];

  // Typing animation effect
  useEffect(() => {
    const prompt = prompts[promptIndex];
    let charIndex = 0;
    
    setCurrentPrompt('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (charIndex <= prompt.length) {
        setCurrentPrompt(prompt.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        setTimeout(() => {
          setPromptIndex((prev) => (prev + 1) % prompts.length);
        }, 2000);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [promptIndex]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      if (!hasStartedChat) {
        setHasStartedChat(true);
      }

      setChatHistory([
        ...chatHistory,
        {
          type: 'user',
          content: currentMessage,
          timestamp: new Date()
        }
      ]);

      // Simulate AI response
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          {
            type: 'assistant',
            content: 'This is a simulated response. Connect your AI backend here.',
            timestamp: new Date()
          }
        ]);
      }, 1000);

      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setHasStartedChat(false);
    setChatHistory([]);
    setCurrentMessage('');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isAssistantPage={true} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        hasStartedChat ? 'mr-80' : ''
      }`}>
        <Header />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Empty State - Shows before chat starts */}
          {!hasStartedChat && (
            <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
              <div className="w-full max-w-5xl text-center mb-12">
                <h1 className="text-5xl font-bold">
                  How Can I Help You Today?
                </h1>
              </div>
            </div>
          )}

          {/* Chat Messages - Shows when chat started */}
          {hasStartedChat && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {chatHistory.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Input Area - Always visible */}
          <div className="border-t border-border bg-background">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
              <div className="bg-gradient-to-br from-secondary to-secondary/80 border border-border rounded-3xl p-6 lg:p-8 shadow-2xl">
                
                {/* Input Area */}
                <div className="mb-6 min-h-[64px] flex items-center">
                  {!hasStartedChat ? (
                    <>
                      <input
                        type="text"
                        value={currentPrompt}
                        placeholder="What would you like to create?"
                        className="w-full bg-transparent text-muted-foreground text-xl lg:text-2xl outline-none placeholder-muted"
                        readOnly
                      />
                      {isTyping && (
                        <span className="inline-block w-0.5 h-6 lg:h-7 bg-muted-foreground ml-1 animate-pulse" />
                      )}
                    </>
                  ) : (
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full bg-transparent text-foreground text-xl lg:text-2xl outline-none placeholder-muted resize-none"
                      style={{ minHeight: '32px', maxHeight: '200px' }}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  {/* Left Actions */}
                  <div className="flex items-center gap-1">
                    <button 
                      className="p-2.5 hover:bg-accent rounded-lg transition-colors"
                      title="Add attachment"
                    >
                      <Plus size={20} className="text-muted-foreground" />
                    </button>
                    
                    <button 
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-accent rounded-lg transition-colors"
                      title="Workflows"
                    >
                      <Network size={20} className="text-muted-foreground" />
                      <span className="text-muted-foreground font-medium hidden sm:inline">Workflows</span>
                    </button>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-2.5 hover:bg-accent rounded-lg transition-colors"
                      title="Voice input"
                    >
                      <Mic size={20} className="text-muted-foreground" />
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-accent rounded-lg transition-colors border border-border"
                          title="Select model"
                        >
                          <Sparkles size={18} className="text-muted-foreground" />
                          <span className="text-muted-foreground font-medium hidden sm:inline">Model</span>
                          <ChevronDown size={16} className="text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model}
                            onClick={() => setSelectedModel(model)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {selectedModel === model && (
                                <span className="text-primary">✓</span>
                              )}
                              <span className={selectedModel === model ? 'font-medium' : ''}>
                                {model}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <button 
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() && hasStartedChat}
                      className="w-12 h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Submit"
                    >
                      {hasStartedChat ? (
                        <Send size={20} className="text-primary-foreground" />
                      ) : (
                        <ArrowUp size={22} className="text-primary-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {hasStartedChat && (
                <div className="text-center mt-2 text-xs text-muted-foreground">
                  {currentMessage.length} characters
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar - Chat History */}
      {hasStartedChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border flex flex-col z-50">
          
          {/* Header */}
          <div className="p-4 border-b border-border">
            <button
              onClick={handleNewChat}
              className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Date Section */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Today
              </h3>
              
              {/* Chat Items */}
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full text-left px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors group"
                  >
                    <p className="text-sm text-foreground group-hover:text-primary line-clamp-1">
                      {conv.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Yesterday section */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Yesterday
              </h3>
              <div className="text-sm text-muted-foreground text-center py-4">
                No conversations
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;
