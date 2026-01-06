import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Clock, SlidersHorizontal, Maximize2, Minimize2, Mic, Plus, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIVASidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIVASidePanel = ({ isOpen, onClose }: AIVASidePanelProps) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (message.trim()) {
      // Handle message send
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div 
        className={`fixed left-16 lg:left-64 top-0 h-full bg-background border-r border-border shadow-xl z-50 transition-all duration-300 flex flex-col ${
          isExpanded ? 'w-[600px]' : 'w-[400px]'
        }`}
      >
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
                  <button className="p-2 rounded-lg hover:bg-muted transition">
                    <Clock size={18} className="text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>History</p>
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
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          {/* Empty State */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-4">
              <div className="w-2 h-2 rounded-full bg-brand-green" />
              <div className="w-2 h-2 rounded-full bg-brand-green" />
              <div className="w-2 h-2 rounded-full bg-brand-green" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">How Can I Help?</h2>
            <p className="text-sm text-muted-foreground">Ask AIVA anything about your project</p>
          </div>
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
              placeholder="Ask AIVA anything..."
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-3"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition text-sm text-muted-foreground">
                  <SlidersHorizontal size={14} />
                  Tools
                </button>
                <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition">
                  <Plus size={16} className="text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-muted transition">
                  <Mic size={18} className="text-muted-foreground" />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="p-2 rounded-full bg-brand-green/20 hover:bg-brand-green/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} className="text-brand-green" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIVASidePanel;
