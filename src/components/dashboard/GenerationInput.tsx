import { Image, Sparkles, MoreHorizontal, MoreVertical, ChevronDown, User, ChevronRight, Flame, Zap, Video, Dices, Gift, FileText, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerationInputProps {
  selectedType: string;
  onCharactersClick?: () => void;
}

const GenerationInput = ({ selectedType, onCharactersClick }: GenerationInputProps) => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('nano-banana');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Auto');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const { toast } = useToast();
  
  const isVideoMode = selectedType === 'Video';
  const isAudioMode = selectedType === 'Audio';
  const isDesignMode = selectedType === 'Design';
  const isContentMode = selectedType === 'Content';
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("Starting image generation...");
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: prompt.trim(),
          aspectRatio: selectedAspectRatio,
          model: selectedModel
        }
      });

      if (error) throw error;

      toast({
        title: "Image generated!",
        description: "Your image has been created successfully",
      });

      console.log("Generated image:", data.image);
      
      // Clear prompt after successful generation
      setPrompt('');
      
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompt = async (fast = false) => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to enhance",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      console.log("Enhancing prompt...");
      
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { 
          prompt: prompt.trim(),
          fast: fast
        }
      });

      if (error) throw error;

      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({
          title: "Prompt enhanced!",
          description: fast ? "Quick enhancement complete" : "Your prompt has been improved with AI",
        });
        console.log("Enhanced prompt:", data.enhancedPrompt);
      }
      
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance prompt",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto mb-4">
      <div className="bg-background border-2 border-border rounded-xl p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <div className="flex flex-col items-start gap-2">
                {isVideoMode ? (
                  <button className="bg-muted/50 rounded-lg p-2">
                    <Video size={18} className="text-muted-foreground" />
                  </button>
                ) : isAudioMode ? (
                  <button className="bg-muted/50 rounded-lg p-2">
                    <Sparkles size={18} className="text-muted-foreground" />
                  </button>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition">
                          <Image size={18} className="text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Image-To-Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => handleEnhancePrompt(false)}
                          disabled={isEnhancing || !prompt.trim()}
                          className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={18} className="text-muted-foreground animate-spin" />
                          ) : (
                            <Dices size={18} className="text-muted-foreground" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Auto Enhance Prompt with AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full text-foreground text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground disabled:opacity-50"
              rows={3}
              placeholder="Describe what you want to create..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {isVideoMode ? (
              <>
                {/* Video Mode Controls */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                            <Video size={14} />
                            Veo 3 Fast
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              Veo 3 Fast
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              Veo 3 Standard
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Model</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            <Image size={14} />
                            References
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground px-3 py-2">Upload reference images</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>References</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            16:9
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                              <div className="w-5 h-3 border-2 border-current"></div>
                              16:9 Landscape
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                              <div className="w-3 h-5 border-2 border-current"></div>
                              9:16 Portrait
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-current"></div>
                              1:1 Square
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aspect Ratio</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            4 sec
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              4 seconds
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              8 seconds
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              12 seconds
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Duration</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            1080p
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              1080p
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              720p
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              4K
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quality</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition bg-muted/50 rounded-lg p-2">
                        <MoreVertical size={20} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance Prompt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : isAudioMode ? (
              <>
                {/* Audio Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      Model
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Eleven Turbo v2.5
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Eleven Multilingual v2
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <button 
                  onClick={onCharactersClick}
                  className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap"
                >
                  Character
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Language
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        English
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Spanish
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        French
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Accent
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        American
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        British
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Australian
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Speed
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Normal
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Fast
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Slow
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Tone
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Neutral
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Friendly
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Professional
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition bg-muted/50 rounded-lg p-2">
                        <MoreVertical size={20} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance Prompt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : isDesignMode ? (
              <>
                {/* Design Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Nano Banana
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0 bg-white border-sidebar-hover z-50" align="start">
                    <div className="space-y-1 p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-foreground text-sm">Auto</span>
                              <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">AI picks what's best</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Type
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Brochure
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Cover
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Flyer
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Infographic
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Invitation
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Logo
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Poster
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Thumbnail
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Create
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 bg-background border-border z-50 p-2">
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Flame size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-base">Start With A Template</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium text-base">Build With AI</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-base">Start With A File</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : isContentMode ? (
              <>
                {/* Content Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Nano Banana
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0 bg-white border-sidebar-hover z-50" align="start">
                    <div className="space-y-1 p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-foreground text-sm">Auto</span>
                              <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">AI picks what's best</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Type
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Article
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        eBook
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Presentation
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Social
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                {/* Image Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      {selectedModel === 'auto' && 'Auto'}
                      {selectedModel === 'nano-banana' && 'Nano Banana'}
                      {selectedModel === 'seedream' && 'Seedream'}
                      {selectedModel === 'seedream-4k' && 'Seedream 4K'}
                      {selectedModel === 'flux' && 'Flux'}
                      {selectedModel === 'mystic' && 'Mystic'}
                      {selectedModel === 'grok' && 'Grok'}
                      {selectedModel === 'ideogram' && 'Ideogram 3'}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0 bg-white border-sidebar-hover z-50" align="start">
                <div className="space-y-1 p-2">
                  {/* Auto */}
                  <button 
                    onClick={() => setSelectedModel('auto')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Auto</span>
                          <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">AI picks what's best</p>
                      </div>
                    </div>
                  </button>

                  {/* Seedream 4 4K */}
                  <button 
                    onClick={() => setSelectedModel('seedream-4k')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">S4</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Seedream 4 4K</span>
                          <Badge className="bg-brand-red text-primary text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                            <Flame size={10} />
                            TRENDING
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">The only 4K with image references and strong aesthetics</p>
                      </div>
                    </div>
                  </button>

                  {/* Seedream */}
                  <button 
                    onClick={() => setSelectedModel('seedream')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">SD</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Seedream</span>
                          <Badge className="bg-brand-blue text-primary text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Exceptional creativity</p>
                      </div>
                    </div>
                  </button>

                  {/* Flux */}
                  <button 
                    onClick={() => setSelectedModel('flux')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-yellow to-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">FX</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Flux</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Most loved by the AI community</p>
                      </div>
                    </div>
                  </button>

                  {/* Mystic */}
                  <button 
                    onClick={() => setSelectedModel('mystic')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-yellow to-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">MY</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Mystic</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Freepik AI at 2K resolution</p>
                      </div>
                    </div>
                  </button>

                  {/* Google */}
                  <button 
                    onClick={() => setSelectedModel('nano-banana')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Google</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Photorealism and prompt adherence</p>
                      </div>
                    </div>
                  </button>

                  {/* Grok */}
                  <button 
                    onClick={() => setSelectedModel('grok')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src="/src/assets/model-logos/grok.png" 
                        alt="Grok" 
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Grok</span>
                          <Badge className="bg-brand-purple text-primary text-[10px] px-1.5 py-0 h-4">PREMIUM</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Maximum quality and detail</p>
                      </div>
                    </div>
                  </button>

                  {/* Ideogram 3 */}
                  <button 
                    onClick={() => setSelectedModel('ideogram')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">I3</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Ideogram 3</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Typography and graphic design</p>
                      </div>
                    </div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition whitespace-nowrap flex items-center gap-2">
                  {selectedStyle}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-background border-border z-50">
                <div className="space-y-1">
                  <button 
                    onClick={() => setSelectedStyle('Auto')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Auto
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('Photorealistic')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Photorealistic
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('Artistic')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Artistic
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('Anime')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Anime
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('3D Render')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    3D Render
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('Cartoon')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Cartoon
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('Oil Painting')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Oil Painting
                  </button>
                  <button 
                    onClick={() => setSelectedStyle('Watercolor')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    Watercolor
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            <button 
              onClick={onCharactersClick}
              className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition whitespace-nowrap"
            >
              Character
            </button>
            
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      <Image size={14} />
                      References
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-background border-border z-50">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground px-3 py-2">Upload reference images</p>
                    </div>
                  </PopoverContent>
                </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                  {selectedAspectRatio}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-background border-border z-50">
                <div className="space-y-1">
                  <button 
                    onClick={() => setSelectedAspectRatio('1:1')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-current"></div>
                    1:1 Square
                  </button>
                  <button 
                    onClick={() => setSelectedAspectRatio('16:9')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                  >
                    <div className="w-5 h-3 border-2 border-current"></div>
                    16:9 Landscape
                  </button>
                  <button 
                    onClick={() => setSelectedAspectRatio('9:16')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                  >
                    <div className="w-3 h-5 border-2 border-current"></div>
                    9:16 Portrait
                  </button>
                  <button 
                    onClick={() => setSelectedAspectRatio('4:3')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                  >
                    <div className="w-5 h-4 border-2 border-current"></div>
                    4:3 Standard
                  </button>
                  <button 
                    onClick={() => setSelectedAspectRatio('21:9')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                  >
                    <div className="w-6 h-3 border-2 border-current"></div>
                    21:9 Ultrawide
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap">
                  {numberOfImages} {numberOfImages === 1 ? 'Image' : 'Images'}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-background border-border z-50">
                <div className="space-y-1">
                  <button 
                    onClick={() => setNumberOfImages(1)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    1 Image
                  </button>
                  <button 
                    onClick={() => setNumberOfImages(2)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    2 Images
                  </button>
                  <button 
                    onClick={() => setNumberOfImages(3)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    3 Images
                  </button>
                  <button 
                    onClick={() => setNumberOfImages(4)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    4 Images
                  </button>
                  <button 
                    onClick={() => setNumberOfImages(5)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    5 Images
                  </button>
                </div>
              </PopoverContent>
            </Popover>
                <button className="text-muted-foreground hover:text-foreground transition bg-muted rounded-lg p-2">
                  <MoreVertical size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        disabled={isEnhancing || !prompt.trim()}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium flex items-center gap-2 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnhancing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        AI
                        <ChevronDown size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 bg-background border-border z-50">
                      <div className="space-y-1">
                        <button 
                          onClick={() => handleEnhancePrompt(true)}
                          disabled={isEnhancing || !prompt.trim()}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <Zap size={14} className="text-brand-yellow" />
                            <div>
                              <div className="font-medium">Fast Enhance</div>
                              <div className="text-xs text-muted-foreground">Quick improvement</div>
                            </div>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleEnhancePrompt(false)}
                          disabled={isEnhancing || !prompt.trim()}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-brand-purple" />
                            <div>
                              <div className="font-medium">Deep Enhance</div>
                              <div className="text-xs text-muted-foreground">Detailed refinement</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enhance Prompt with AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="px-6 py-2.5 bg-brand-green hover:opacity-90 text-primary rounded-lg font-semibold flex items-center gap-2 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate For Free!"
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-brand-green rounded flex items-center justify-center flex-shrink-0">
                      <Gift size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-2">Generate FREE: 5 Images, 1 Video</p>
                      <p className="text-xs leading-relaxed">
                        Create for FREE today!<br />
                        Design your first AI images at no cost,<br />
                        and instantly transform them into video.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationInput;
