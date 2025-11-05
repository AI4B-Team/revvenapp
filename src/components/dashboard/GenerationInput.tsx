import { Image, Sparkles, MoreHorizontal, ChevronDown, User, ChevronRight, Flame, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const GenerationInput = () => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="bg-background border-2 border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Image size={20} className="text-muted-foreground" />
            <Sparkles size={20} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Describe what you want to see..."
            className="flex-1 text-foreground placeholder-muted-foreground outline-none bg-transparent text-lg"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
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
              <PopoverContent className="w-[420px] p-0 bg-sidebar-background border-sidebar-hover z-50" align="start">
                <div className="space-y-1 p-2">
                  {/* Auto */}
                  <button className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-purple rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sidebar-text text-sm">Auto</span>
                          <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">AI picks what's best</p>
                      </div>
                    </div>
                  </button>

                  {/* Seedream 4 4K */}
                  <button className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">S4</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sidebar-text text-sm">Seedream 4 4K</span>
                          <Badge className="bg-brand-red text-primary text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                            <Flame size={10} />
                            TRENDING
                          </Badge>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">The only 4K with image references and strong aesthetics</p>
                      </div>
                    </div>
                  </button>

                  {/* Seedream */}
                  <button 
                    onClick={() => setExpandedModel(expandedModel === 'seedream' ? null : 'seedream')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">SD</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sidebar-text text-sm">Seedream</span>
                          <Badge className="bg-brand-blue text-primary text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">Exceptional creativity</p>
                      </div>
                      <ChevronRight size={16} className="text-sidebar-text-muted" />
                    </div>
                  </button>

                  {/* Flux */}
                  <button 
                    onClick={() => setExpandedModel(expandedModel === 'flux' ? null : 'flux')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-yellow to-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">FX</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sidebar-text text-sm">Flux</span>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">Most loved by the AI community</p>
                      </div>
                      <ChevronRight size={16} className="text-sidebar-text-muted" />
                    </div>
                  </button>

                  {/* Mystic */}
                  <button 
                    onClick={() => setExpandedModel(expandedModel === 'mystic' ? null : 'mystic')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">MY</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sidebar-text text-sm">Mystic</span>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">Freepik AI at 2K resolution</p>
                      </div>
                      <ChevronRight size={16} className="text-sidebar-text-muted" />
                    </div>
                  </button>

                  {/* Google */}
                  <button 
                    onClick={() => setExpandedModel(expandedModel === 'google' ? null : 'google')}
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
                          <span className="font-semibold text-sidebar-text text-sm">Google</span>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">Photorealism and prompt adherence</p>
                      </div>
                      <ChevronRight size={16} className="text-sidebar-text-muted" />
                    </div>
                  </button>
                  
                  {/* Google Sub-options */}
                  {expandedModel === 'google' && (
                    <div className="ml-11 space-y-1 border-l-2 border-sidebar-hover pl-3">
                      <button className="w-full text-left px-3 py-2 hover:bg-sidebar-hover rounded-md transition">
                        <p className="text-sm text-sidebar-text">Google Nano Banana</p>
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-sidebar-hover rounded-md transition">
                        <p className="text-sm text-sidebar-text">Google Imagen 3</p>
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-sidebar-hover rounded-md transition">
                        <p className="text-sm text-sidebar-text">Google Imagen 4 Fast</p>
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-sidebar-hover rounded-md transition">
                        <p className="text-sm text-sidebar-text">Google Imagen 4</p>
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-sidebar-hover rounded-md transition">
                        <p className="text-sm text-sidebar-text">Google Imagen 4 Ultra</p>
                      </button>
                    </div>
                  )}

                  {/* Ideogram 3 */}
                  <button 
                    onClick={() => setExpandedModel(expandedModel === 'ideogram' ? null : 'ideogram')}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">I3</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sidebar-text text-sm">Ideogram 3</span>
                        </div>
                        <p className="text-xs text-sidebar-text-muted">Typography and graphic design</p>
                      </div>
                      <ChevronRight size={16} className="text-sidebar-text-muted" />
                    </div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            <button className="px-4 py-1.5 hover:bg-secondary rounded-md text-sm transition whitespace-nowrap">
              Style
            </button>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 hover:bg-secondary rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                  Character
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-background border-border z-50">
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                    <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span>Vicki Ravelle</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                    <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span>Zara Saige</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition border-t border-border mt-2 pt-3">
                    <Sparkles size={16} />
                    <span>Create Character</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 hover:bg-secondary rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
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
                <button className="px-4 py-1.5 hover:bg-secondary rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
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
                <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap">
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
            <button className="text-muted-foreground hover:text-foreground transition">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium flex items-center gap-2 transition text-sm whitespace-nowrap">
              <Sparkles size={16} />
              AI
            </button>
            <button className="px-6 py-2.5 bg-brand-green hover:opacity-90 text-primary rounded-lg font-semibold flex items-center gap-2 transition whitespace-nowrap">
              Generate For Free!
            </button>
          </div>
        </div>
      </div>

      {/* Free Generation Tooltip */}
      <div className="relative">
        <div className="absolute right-0 mt-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-brand-green rounded flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <span className="font-semibold text-sm">Generate FREE: 5 Images, 1 Video</span>
            <button className="ml-auto text-muted-foreground hover:text-primary-foreground">×</button>
          </div>
          <p className="text-xs text-primary-foreground/80">
            <span className="font-semibold">Start creating for free.</span><br />
            Generate your first AI images for free,<br />
            then bring them to life with video.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenerationInput;
