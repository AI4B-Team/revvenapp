import { useState, useEffect, useCallback } from 'react';
import { Plus, Network, Mic, ArrowUp, Search, Sparkles, ChevronDown } from 'lucide-react';
import { useResizableTextarea } from '@/hooks/useResizableTextarea';
import ResizeHandle from '@/components/ui/ResizeHandle';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ChatHistorySidebar from '@/components/dashboard/ChatHistorySidebar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
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
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // Resizable prompt box (both directions)
  const { height: promptHeight, width: promptWidth, isResizing, handleResizeStart } = useResizableTextarea({
    minHeight: 60,
    maxHeight: 300,
    initialHeight: 64,
    minWidth: 400,
    maxWidth: 1200,
    resizeDirection: 'both',
  });

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isAssistantPage={true}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <ChatHistorySidebar />
          
          <main className="flex-1 overflow-auto">
          <div className="flex flex-col items-center justify-start min-h-full px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
            
            {/* Header Text */}
            <div className="w-full max-w-5xl text-center mb-12">
              <h1 className="text-5xl font-bold">
                How Can I Help You Today?
              </h1>
            </div>

            {/* Main Prompt Box */}
            <div className="w-full max-w-5xl">
              <div className="bg-background border border-border rounded-3xl p-6 lg:p-8 shadow-2xl">
                
                {/* Input Area with Animated Text */}
                <div className="mb-6 relative" style={{ height: promptHeight, width: promptWidth }}>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={currentPrompt + (isTyping ? '' : '...')}
                    className="w-full h-full bg-transparent text-foreground text-xl lg:text-2xl outline-none placeholder-muted-foreground resize-none pr-8"
                  />
                  <ResizeHandle 
                    onResizeStart={handleResizeStart} 
                    isResizing={isResizing}
                    variant="subtle"
                  />
                  {isResizing && <div className="fixed inset-0 cursor-nwse-resize z-50" />}
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
                      className="w-12 h-12 bg-brand-green hover:bg-brand-green/90 rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Submit"
                    >
                      <ArrowUp size={22} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
         </main>
        </div>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen} 
        onClose={() => setIdentitySidebarOpen(false)}
      />
    </div>
  );
};

export default Assistant;
