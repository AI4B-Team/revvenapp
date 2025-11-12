import { Image, Sparkles, MoreHorizontal, MoreVertical, ChevronDown, User, ChevronRight, Flame, Zap, Video, Dices, Gift } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

interface GenerationInputProps {
  selectedType: string;
  onCharactersClick?: () => void;
}

const GenerationInput = ({ selectedType, onCharactersClick }: GenerationInputProps) => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  
  const isVideoMode = selectedType === 'Video';
  const isAudioMode = selectedType === 'Audio';
  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="bg-background border-2 border-border rounded-xl p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <div className="flex items-center gap-1">
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
                        <button className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition">
                          <Dices size={18} className="text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1">
            <textarea 
              className="w-full text-foreground text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground"
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
              </>
            ) : (
              <>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                  1:1
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-background border-border z-50">
                <div className="space-y-1">
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current"></div>
                    1:1 Square
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                    <div className="w-5 h-3 border-2 border-current"></div>
                    16:9 Landscape
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                    <div className="w-3 h-5 border-2 border-current"></div>
                    9:16 Portrait
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                    <div className="w-5 h-4 border-2 border-current"></div>
                    4:3 Standard
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                    <div className="w-6 h-3 border-2 border-current"></div>
                    21:9 Ultrawide
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap">
                  1 Image
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-background border-border z-50">
                <div className="space-y-1">
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                    1 Image
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                    2 Images
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                    3 Images
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                    4 Images
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
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
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium flex items-center gap-2 transition text-sm whitespace-nowrap">
                    <Sparkles size={16} />
                    AI
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enhance Prompt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="px-6 py-2.5 bg-brand-green hover:opacity-90 text-primary rounded-lg font-semibold flex items-center gap-2 transition whitespace-nowrap">
                    Generate For Free!
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
