import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Clock, SlidersHorizontal, Maximize2, Minimize2, Mic, Plus, Send, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'react-router-dom';

interface AIVASidePanelProps {
  isOpen: boolean;
  onClose: () => void;
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
  '/ai-influencer': {
    title: 'AI Influencer',
    suggestions: [
      'Create a new AI character',
      'Generate content for my AI persona',
      'Design a photoshoot concept',
      'Write a bio for my AI influencer',
    ],
  },
  '/social-posts': {
    title: 'Social Content',
    suggestions: [
      'Generate a week of content ideas',
      'Write engaging captions for each platform',
      'Suggest optimal posting times',
      'Create hashtag strategies',
    ],
  },
  '/video-downloader': {
    title: 'Video Downloader',
    suggestions: [
      'Download a video from YouTube',
      'Extract audio from a video',
      'Convert video to different formats',
      'Download multiple videos at once',
    ],
  },
  '/versus': {
    title: 'Versus Comparison',
    suggestions: [
      'Compare two AI image models',
      'Analyze the quality differences',
      'Suggest best model for my use case',
      'Help me choose between options',
    ],
  },
  '/voice-cloner': {
    title: 'Voice Cloner',
    suggestions: [
      'Clone my voice from a recording',
      'Create a custom voice profile',
      'Generate speech with my cloned voice',
      'Improve voice cloning quality',
    ],
  },
  '/voice-changer': {
    title: 'Voice Changer',
    suggestions: [
      'Change my voice to sound younger',
      'Add effects to my recording',
      'Transform voice to different accent',
      'Create a character voice',
    ],
  },
  '/audio-dubber': {
    title: 'Audio Dubber',
    suggestions: [
      'Dub this video to Spanish',
      'Match lip sync for dubbed audio',
      'Preserve original voice emotion',
      'Add multilingual subtitles',
    ],
  },
  '/noise-remover': {
    title: 'Noise Remover',
    suggestions: [
      'Remove background noise from recording',
      'Clean up audio for podcast',
      'Enhance voice clarity',
      'Remove echo from audio',
    ],
  },
  '/background-remover': {
    title: 'Background Remover',
    suggestions: [
      'Remove background from product photo',
      'Replace background with custom image',
      'Create transparent PNG',
      'Batch remove backgrounds',
    ],
  },
  '/image-upscaler': {
    title: 'Image Upscaler',
    suggestions: [
      'Upscale image to 4K resolution',
      'Enhance image details and sharpness',
      'Restore old blurry photos',
      'Increase resolution for printing',
    ],
  },
  '/image-enhancer': {
    title: 'Image Enhancer',
    suggestions: [
      'Improve image lighting and colors',
      'Fix overexposed or dark photos',
      'Sharpen blurry images',
      'Add HDR effect to photos',
    ],
  },
  '/email-generator': {
    title: 'Email Generator',
    suggestions: [
      'Write a professional cold email',
      'Create an email marketing campaign',
      'Generate follow-up email sequences',
      'Craft a newsletter template',
    ],
  },
  '/ad-copy-writer': {
    title: 'Ad Copy Writer',
    suggestions: [
      'Write Facebook ad copy',
      'Create Google Ads headlines',
      'Generate compelling CTAs',
      'Write product descriptions',
    ],
  },
  '/script-writer': {
    title: 'Script Writer',
    suggestions: [
      'Write a YouTube video script',
      'Create a podcast script outline',
      'Generate dialogue for a scene',
      'Write a commercial script',
    ],
  },
  '/seo-optimizer': {
    title: 'SEO Optimizer',
    suggestions: [
      'Optimize my page for keywords',
      'Analyze competitor SEO strategy',
      'Generate meta tags and descriptions',
      'Improve content readability score',
    ],
  },
  '/ebook-creator': {
    title: 'Ebook Creator',
    suggestions: [
      'Help me outline an ebook',
      'Generate chapter content',
      'Design ebook cover',
      'Format ebook for publishing',
    ],
  },
  '/explainer-video': {
    title: 'Explainer Video',
    suggestions: [
      'Create script for explainer video',
      'Suggest visual concepts for scenes',
      'Generate voiceover narration',
      'Add animations and transitions',
    ],
  },
  '/viral-shorts': {
    title: 'Viral Shorts',
    suggestions: [
      'Create a viral TikTok concept',
      'Generate hook ideas for Reels',
      'Write captions that drive engagement',
      'Suggest trending sounds to use',
    ],
  },
  '/ai-story': {
    title: 'AI Story',
    suggestions: [
      'Generate a compelling story premise',
      'Create character backgrounds',
      'Write plot twists and conflicts',
      'Design visual scenes for story',
    ],
  },
  '/lead-generation': {
    title: 'Lead Generation',
    suggestions: [
      'Find leads in my target market',
      'Export leads to spreadsheet',
      'Enrich lead data with emails',
      'Create lead scoring criteria',
    ],
  },
  '/newsletter': {
    title: 'Newsletter',
    suggestions: [
      'Write engaging newsletter content',
      'Design newsletter template',
      'Analyze open rate metrics',
      'Schedule newsletter campaigns',
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

const AIVASidePanel = ({ isOpen, onClose }: AIVASidePanelProps) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Get suggestions based on current app
  const currentPath = location.pathname;
  const appConfig = appSuggestions[currentPath] || appSuggestions.default;

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

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
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
