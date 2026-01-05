import { useState } from 'react';
import { Maximize2, Minimize2, Send, Plus, SlidersHorizontal, History, PanelLeftClose, Mic, MessageSquare, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AIChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

type ViewMode = 'chat' | 'history' | 'settings';

const AIChatPanel = ({ isOpen, onToggle }: AIChatPanelProps) => {
  const [message, setMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('chat');
  const [historySearch, setHistorySearch] = useState('');
  const [toolsSelected, setToolsSelected] = useState(false);
  const [plusSelected, setPlusSelected] = useState(false);

  // When closed, render nothing - user opens via AIVA icon in sidebar
  if (!isOpen) {
    return null;
  }

  // Fullscreen mode - takes over entire screen like home page
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-10">
        {/* Header with exit button */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <Minimize2 size={18} className="text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit FullScreen</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onToggle}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <PanelLeftClose size={18} className="text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Centered content like home page */}
        <div className="flex flex-col items-center w-full max-w-2xl">
          {/* Animated Dots */}
          <div className="flex gap-1.5 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <h1 className="text-4xl md:text-[42px] font-semibold text-foreground tracking-tight font-display leading-tight mb-8">How Can I Help?</h1>
          
          {/* Large Input Box */}
          <div className="w-full bg-card border-2 border-primary rounded-2xl p-4 shadow-lg">
            <textarea
              placeholder="Ask AIVA anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[60px]"
              rows={2}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setToolsSelected(!toolsSelected)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    toolsSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'text-muted-foreground bg-muted hover:bg-border'
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  Tools
                </button>
                <button 
                  onClick={() => setPlusSelected(!plusSelected)}
                  className={`p-1.5 rounded-md transition-colors ${
                    plusSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'text-muted-foreground bg-muted hover:bg-border'
                  }`}
                >
                  <Plus size={16} />
                </button>
                <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                  <Mic size={16} />
                </button>
              </div>
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  message ? 'bg-primary text-primary-foreground' : 'bg-primary/30 text-primary-foreground/50'
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border-r border-border flex flex-col transition-all duration-300 w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setActiveView('chat')}
                className={`p-1.5 rounded-md transition-colors ${activeView === 'chat' ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <MessageSquare size={14} className={activeView === 'chat' ? 'text-primary' : 'text-muted-foreground'} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setActiveView('history')}
                className={`p-1.5 rounded-md transition-colors ${activeView === 'history' ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <History size={14} className={activeView === 'history' ? 'text-primary' : 'text-muted-foreground'} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>History</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setActiveView('settings')}
                className={`p-1.5 rounded-md transition-colors ${activeView === 'settings' ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <SlidersHorizontal size={14} className={activeView === 'settings' ? 'text-primary' : 'text-muted-foreground'} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <Maximize2 size={14} className="text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>FullScreen</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onToggle}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <PanelLeftClose size={14} className="text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main Content - flex-1 with content at bottom using mt-auto */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeView === 'history' ? (
          <>
            {/* History Search Box */}
            <div className="p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Chat"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Empty State */}
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No Results</p>
            </div>
          </>
        ) : activeView === 'settings' ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Settings coming soon</p>
          </div>
        ) : (
          /* Chat View - Bottom section with dots, title, and input - pushed to bottom with mt-auto */
          <div className="mt-auto px-4 pb-4">
            {/* Animated Dots */}
            <div className="flex gap-1 mb-3 justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <h3 className="text-sm font-medium text-foreground text-center mb-3">How Can I Help?</h3>
            
            {/* Input Box */}
            <div className="w-full bg-card border-2 border-primary rounded-xl p-3">
              <input
                type="text"
                placeholder="Ask AIVA anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setToolsSelected(!toolsSelected)}
                    className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors ${
                      toolsSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'text-muted-foreground bg-muted hover:bg-border'
                    }`}
                  >
                    <SlidersHorizontal size={12} />
                    Tools
                  </button>
                  <button 
                    onClick={() => setPlusSelected(!plusSelected)}
                    className={`p-1.5 rounded-md transition-colors ${
                      plusSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'text-muted-foreground bg-muted hover:bg-border'
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                    <Mic size={14} />
                  </button>
                  <button 
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      message ? 'bg-primary text-primary-foreground' : 'bg-primary/30 text-primary-foreground/50'
                    }`}
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPanel;
