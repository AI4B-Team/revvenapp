import { useState } from 'react';
import { 
  Plus, Settings, ChevronRight, Paperclip, Mic, Send,
  Sparkles, MessageSquare, Bot
} from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const LunaChat = () => {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

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
            content: 'Hi! I\'m Luna, your AI assistant. How can I help you create amazing content today?',
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
    <div className="flex h-full">
      {/* Left Sidebar - Purple Gradient */}
      <div className="w-80 bg-gradient-to-b from-brand-purple to-purple-800 text-white flex flex-col">
        {/* Profile Section */}
        <div className="p-6">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-2">
                    <Bot className="w-24 h-24 mx-auto" />
                  </div>
                  <div className="text-sm font-medium opacity-80">Luna AI</div>
                </div>
              </div>
            </div>
            
            {/* Settings Button */}
            <button className="absolute top-3 right-3 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors">
              <Settings size={20} />
            </button>
          </div>

          {/* Name and Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Luna</h2>
            <p className="text-purple-200 text-sm">AI Assistant</p>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={handleNewChat}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>New chat</span>
          </button>
        </div>

        {/* History Section */}
        <div className="flex-1 px-6 overflow-y-auto">
          <div className="text-center py-12">
            <div className="mb-4">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto opacity-50">
                <rect x="20" y="25" width="40" height="35" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M20 35 L40 45 L60 35" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="40" y1="45" x2="40" y2="60" stroke="currentColor" strokeWidth="2"/>
                <circle cx="40" cy="20" r="3" fill="currentColor" opacity="0.3"/>
                <circle cx="30" cy="23" r="2" fill="currentColor" opacity="0.2"/>
                <circle cx="50" cy="23" r="2" fill="currentColor" opacity="0.2"/>
              </svg>
            </div>
            
            <h3 className="text-base font-semibold mb-2">History is empty</h3>
            <p className="text-sm text-purple-200">
              New conversations will appear here
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Empty State - Centered */}
        {!hasStartedChat && (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h1 className="text-5xl lg:text-6xl font-bold mb-4">
                Hey, it's <span className="text-brand-purple">Luna</span>.
              </h1>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                What can I help you with?
              </h2>
            </div>

            <button className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-full font-medium flex items-center gap-2 transition-colors">
              <span>Explore use cases</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Chat Messages */}
        {hasStartedChat && (
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {chatHistory.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 ${
                      message.type === 'user'
                        ? 'bg-brand-purple text-white'
                        : 'bg-card text-card-foreground shadow-sm border border-border'
                    }`}
                  >
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Bottom */}
        <div className="border-t border-border bg-card px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border-2 border-border rounded-2xl p-4 focus-within:border-brand-purple transition-colors shadow-sm">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send a message"
                className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-base mb-3"
              />

              {/* Actions Row */}
              <div className="flex items-center justify-between">
                {/* Left Icons */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Mic size={20} />
                  </button>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-brand-blue hover:opacity-80 transition-opacity">
                    <Sparkles size={20} />
                  </button>
                  <button className="p-2 text-brand-green hover:opacity-80 transition-opacity">
                    <MessageSquare size={20} />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className="w-10 h-10 bg-brand-purple hover:opacity-90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunaChat;
