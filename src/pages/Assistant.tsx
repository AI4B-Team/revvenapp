import { useState, useEffect } from 'react';
import { Plus, Copy, Network, Settings, ArrowUp, Search } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Assistant = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

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
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col items-center justify-start px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
            
            {/* Header Text */}
            <div className="w-full max-w-5xl text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                {getGreeting()},
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-muted-foreground">
                What do you want to create?
              </h2>
            </div>

            {/* Main Prompt Box */}
            <div className="w-full max-w-5xl">
              <div className="bg-gradient-to-br from-secondary to-secondary/80 border border-border rounded-3xl p-6 lg:p-8 shadow-2xl">
                
                {/* Input Area with Animated Text */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={currentPrompt}
                    placeholder="What would you like to create?"
                    className="w-full bg-transparent text-muted-foreground text-xl lg:text-2xl outline-none placeholder-muted"
                    readOnly
                  />
                  {/* Typing Cursor */}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-6 lg:h-7 bg-muted-foreground ml-1 animate-pulse" />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  {/* Left Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-2.5 hover:bg-accent rounded-lg transition-colors"
                      title="Add attachment"
                    >
                      <Plus size={20} className="text-muted-foreground" />
                    </button>
                    
                    <button 
                      className="p-2.5 hover:bg-accent rounded-lg transition-colors"
                      title="Copy"
                    >
                      <Copy size={20} className="text-muted-foreground" />
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
                      title="Settings"
                    >
                      <Settings size={20} className="text-muted-foreground" />
                    </button>
                    
                    <button 
                      className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Submit"
                    >
                      <ArrowUp size={22} className="text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Workflows Card */}
            <div className="w-full max-w-5xl mt-12">
              <div className="relative bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl h-64 lg:h-80">
                {/* Abstract Background Image Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-8 lg:p-10">
                  <h3 className="text-3xl lg:text-4xl font-bold text-white">
                    Explore workflows
                  </h3>
                  
                  <button className="self-end px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-semibold flex items-center gap-2 transition-colors shadow-xl">
                    <Search size={20} />
                    <span>Explore</span>
                  </button>
                </div>

                {/* Abstract Fluid Background */}
                <div className="absolute inset-0 opacity-60">
                  <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z" 
                      fill="url(#gradient1)" 
                      opacity="0.3"
                    >
                      <animate 
                        attributeName="d" 
                        dur="8s" 
                        repeatCount="indefinite"
                        values="
                          M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z;
                          M0,250 Q200,150 400,250 T800,250 L800,400 L0,400 Z;
                          M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z
                        "
                      />
                    </path>
                    <path 
                      d="M0,250 Q200,200 400,250 T800,250 L800,400 L0,400 Z" 
                      fill="url(#gradient1)" 
                      opacity="0.2"
                    >
                      <animate 
                        attributeName="d" 
                        dur="10s" 
                        repeatCount="indefinite"
                        values="
                          M0,250 Q200,200 400,250 T800,250 L800,400 L0,400 Z;
                          M0,200 Q200,250 400,200 T800,200 L800,400 L0,400 Z;
                          M0,250 Q200,200 400,250 T800,250 L800,400 L0,400 Z
                        "
                      />
                    </path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-5xl mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Image Generation', emoji: '🎨' },
                { label: 'Video Creation', emoji: '🎬' },
                { label: 'Content Writing', emoji: '✍️' },
                { label: 'Audio Production', emoji: '🎵' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className="bg-secondary hover:bg-secondary/80 border border-border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                >
                  <div className="text-4xl mb-3">{action.emoji}</div>
                  <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {action.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Assistant;
