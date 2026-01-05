import { useState, useEffect, useCallback } from 'react';
import { Mic, Send, Sparkles, Video, Pencil, User, Users, RefreshCw, BarChart, BookOpen, Headphones, Image, Layers, Camera, ArrowRightLeft, AudioLines, Music, FileText, CreditCard, ImageIcon, LayoutTemplate, TableCellsMerge, Mail, FolderOpen, Shuffle, LayoutGrid, Box, Brush, Link, Copy, Hash, X, ChevronDown, Monitor, Clock, SlidersHorizontal, Move, PenTool, Check, Search, Kanban, Zap } from 'lucide-react';
import IntentSelector, { type Intent } from '@/components/IntentSelector';
import AutoDropdown, { type AutoOption } from '@/components/AutoDropdown';
import ControlChip from '@/components/ControlChip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { LucideIcon } from 'lucide-react';

const placeholdersByIntent: Record<Intent | 'default', string> = {
  default: 'What do you want to do?',
  Create: 'Describe what you want to create…',
  Research: 'What do you want to research or understand?',
  Plan: 'What do you want to plan or map out?',
  Automate: 'What do you want to automate or systemize?',
};

interface SubOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

interface ControlIcon {
  id: string;
  icon: LucideIcon;
  tooltip: string;
}

// Control icons for Image types
const imageControlIcons: ControlIcon[] = [
  { id: 'model', icon: Box, tooltip: 'Model' },
  { id: 'style', icon: Brush, tooltip: 'Style' },
  { id: 'character', icon: User, tooltip: 'Character' },
  { id: 'reference', icon: Link, tooltip: 'Reference' },
  { id: 'ratio', icon: Copy, tooltip: 'Ratio' },
  { id: 'number', icon: Hash, tooltip: 'Number' },
];

// Control icons for Video types
const videoControlIcons: ControlIcon[] = [
  { id: 'model', icon: Box, tooltip: 'Model' },
  { id: 'character', icon: User, tooltip: 'Character' },
  { id: 'reference', icon: Link, tooltip: 'Reference' },
  { id: 'ratio', icon: Copy, tooltip: 'Ratio' },
  { id: 'duration', icon: Clock, tooltip: 'Duration' },
  { id: 'quality', icon: SlidersHorizontal, tooltip: 'Quality' },
];

// Video type options
const videoTypes: SubOption[] = [
  { id: 'story', label: 'Story', icon: BookOpen, color: 'text-blue-500' },
  { id: 'presentation', label: 'Presentation', icon: Monitor, color: 'text-violet-500' },
  { id: 'vsl', label: 'VSL', icon: BarChart, color: 'text-blue-500' },
  { id: 'avatar', label: 'Avatar', icon: User, color: 'text-violet-500' },
  { id: 'ugc', label: 'UGC', icon: Users, color: 'text-amber-500' },
  { id: 'recast', label: 'Recast', icon: RefreshCw, color: 'text-emerald-500' },
  { id: 'animate', label: 'Animate', icon: Video, color: 'text-red-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'lip-sync', label: 'Lip-Sync', icon: PenTool, color: 'text-red-500' },
  { id: 'motion-sync', label: 'Motion-Sync', icon: Move, color: 'text-violet-500' },
  { id: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-blue-500' },
];

// Image type options
const imageTypes: SubOption[] = [
  { id: 'generate', label: 'Generate', icon: Sparkles, color: 'text-amber-500' },
  { id: 'batch', label: 'Batch', icon: Layers, color: 'text-emerald-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'swap', label: 'Swap', icon: ArrowRightLeft, color: 'text-blue-500' },
  { id: 'photoshoot', label: 'Photoshoot', icon: Camera, color: 'text-violet-500' },
];

// Audio type options
const audioTypes: SubOption[] = [
  { id: 'voiceover', label: 'Voiceover', icon: Mic, color: 'text-emerald-500' },
  { id: 'clone', label: 'Clone', icon: User, color: 'text-violet-500' },
  { id: 'revoice', label: 'Revoice', icon: RefreshCw, color: 'text-cyan-500' },
  { id: 'sound-effects', label: 'Sound Effects', icon: AudioLines, color: 'text-amber-500' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-blue-500' },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones, color: 'text-indigo-500' },
];

// Design type options
const designTypes: SubOption[] = [
  { id: 'brochure', label: 'Brochure', icon: FolderOpen, color: 'text-emerald-500' },
  { id: 'business-card', label: 'Business Card', icon: CreditCard, color: 'text-purple-500' },
  { id: 'cover', label: 'Cover', icon: ImageIcon, color: 'text-blue-500' },
  { id: 'flyer', label: 'Flyer', icon: FileText, color: 'text-amber-500' },
  { id: 'infographic', label: 'Infographic', icon: TableCellsMerge, color: 'text-violet-500' },
  { id: 'invitation', label: 'Invitation', icon: Mail, color: 'text-cyan-500' },
  { id: 'logo', label: 'Logo', icon: Sparkles, color: 'text-yellow-500' },
  { id: 'poster', label: 'Poster', icon: LayoutTemplate, color: 'text-indigo-500' },
  { id: 'thumbnail', label: 'Thumbnail', icon: ImageIcon, color: 'text-red-500' },
];

// Content type options
const contentTypes: SubOption[] = [
  { id: 'social', label: 'Social', icon: LayoutTemplate, color: 'text-blue-500' },
];

// Document type options
const documentTypes: SubOption[] = [
  { id: 'ebook', label: 'Ebook', icon: BookOpen, color: 'text-amber-500' },
  { id: 'whitepaper', label: 'Whitepaper', icon: FileText, color: 'text-slate-500' },
  { id: 'report', label: 'Report', icon: TableCellsMerge, color: 'text-blue-500' },
  { id: 'business-plan', label: 'Business Plan', icon: BarChart, color: 'text-indigo-500' },
  { id: 'handbook', label: 'Handbook', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'proposal', label: 'Proposal', icon: FileText, color: 'text-purple-500' },
  { id: 'case-study', label: 'Case Study', icon: FileText, color: 'text-teal-500' },
  { id: 'cover-letter', label: 'Cover Letter', icon: FileText, color: 'text-red-500' },
  { id: 'presentation', label: 'Presentation', icon: Monitor, color: 'text-orange-500' },
];

interface AIVAPromptBoxProps {
  onGenerate?: () => void;
  showGreeting?: boolean;
  greetingName?: string;
  showTagline?: boolean;
}

const AIVAPromptBox = ({ onGenerate, showGreeting = false, greetingName, showTagline = false }: AIVAPromptBoxProps) => {
  const [prompt, setPrompt] = useState('');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [selectedOption, setSelectedOption] = useState<AutoOption | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOption | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Speech recognition hook
  const handleTranscriptResult = useCallback((transcript: string) => {
    setPrompt(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening, cancelListening } = useSpeechRecognition({
    onResult: handleTranscriptResult,
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(prompt);
    }
  };

  // Reset chips when intent changes
  useEffect(() => {
    setSelectedOption(null);
    setSelectedSubType(null);
    setShowTypeDropdown(false);
  }, [intent]);

  const handleOptionSelect = (option: AutoOption | null) => {
    setSelectedOption(option);
    setSelectedSubType(null);
    setShowTypeDropdown(false);
  };

  const handleRemoveOption = () => {
    setSelectedOption(null);
    setSelectedSubType(null);
    setShowTypeDropdown(false);
  };

  const handleRemoveSubType = () => {
    setSelectedSubType(null);
  };

  const handleSubTypeSelect = (subType: SubOption) => {
    setSelectedSubType(subType);
    setShowTypeDropdown(false);
  };

  const getSubTypeOptions = (): SubOption[] => {
    if (selectedOption?.id === 'video') return videoTypes;
    if (selectedOption?.id === 'image') return imageTypes;
    if (selectedOption?.id === 'audio') return audioTypes;
    if (selectedOption?.id === 'design') return designTypes;
    if (selectedOption?.id === 'content') return contentTypes;
    if (selectedOption?.id === 'document') return documentTypes;
    return [];
  };

  // Get control icons based on selected option type
  const getControlIcons = (): ControlIcon[] => {
    if (selectedOption?.id === 'video') return videoControlIcons;
    return imageControlIcons;
  };

  const showSubTypeSelector = selectedOption !== null;

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Greeting Section */}
      {showGreeting && greetingName && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            <span className="text-xl text-muted-foreground font-medium">Hi {greetingName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            What Would You Like To Do Today?
          </h1>
        </div>
      )}
      
      {/* Tagline for Landing */}
      {showTagline && (
        <div className="text-center">
          <p className="text-lg text-slate-400 mb-2 tracking-wide">
            Create Anything — Automate Everything
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight max-w-[52rem] mx-auto">
            What Would You Like To Do Today?
          </h1>
        </div>
      )}
      
      {/* Intent Selector */}
      <IntentSelector selectedIntent={intent} onIntentChange={setIntent} />
      
      {/* Prompt Input Box */}
      <div className="relative w-fit max-w-full mx-auto">
        <div className="bg-white border-2 border-emerald-400 rounded-3xl shadow-sm overflow-visible min-h-[180px] flex flex-col w-fit max-w-full min-w-[340px] sm:min-w-[520px] md:min-w-[50rem]">
          {/* Left side icons - only shown when an option is selected */}
          {selectedOption && (
            <div className="flex flex-col gap-1 absolute left-4 top-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className={`p-1.5 rounded-lg bg-slate-100 ${selectedOption.color} hover:bg-slate-200 transition-colors`}>
                    <selectedOption.icon size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {selectedOption.id === 'image' ? 'Image-To-Prompt' : selectedOption.label}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-lg bg-slate-100 text-emerald-500 hover:bg-slate-200 transition-colors">
                    <Shuffle size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Auto Prompt</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Input area */}
          <div className={`px-6 pt-5 pb-3 flex-1 ${selectedOption ? 'pl-14' : ''}`}>
            <textarea
              placeholder={isListening ? 'Listening...' : placeholdersByIntent[intent || 'default']}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full border-none text-base text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 pb-4 gap-4 flex-nowrap whitespace-nowrap min-w-0">
            {/* Left side controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {intent && !selectedOption && (
                <AutoDropdown intent={intent} selectedOption={selectedOption} onSelect={handleOptionSelect} />
              )}
              
              {selectedOption && (
                <>
                  <ControlChip 
                    label={selectedOption.label} 
                    icon={selectedOption.icon} 
                    iconColor={selectedOption.color} 
                    onRemove={handleRemoveOption} 
                  />

                  <div className="w-px h-8 bg-slate-200 mx-1 flex-shrink-0" />

                  {selectedSubType ? (
                    <ControlChip 
                      label={selectedSubType.label} 
                      icon={selectedSubType.icon} 
                      iconColor={selectedSubType.color} 
                      onRemove={handleRemoveSubType} 
                    />
                  ) : (
                    <button 
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <LayoutGrid size={16} className="text-slate-500" />
                      <span>Type</span>
                    </button>
                  )}

                  {selectedSubType && (
                    <>
                      <div className="w-px h-8 bg-slate-200 mx-2 flex-shrink-0" />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getControlIcons().map((control) => (
                          <Tooltip key={control.id}>
                            <TooltipTrigger asChild>
                              <button className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                                <control.icon size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{control.tooltip}</TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pl-6">
              {prompt.trim() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">
                      <Sparkles size={16} className="text-violet-500" />
                      <span>AI</span>
                      <ChevronDown size={14} className="text-slate-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Enhance Prompt</TooltipContent>
                </Tooltip>
              )}
              {isSupported && (
                isListening ? (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => {
                            cancelListening();
                            setPrompt('');
                          }}
                          className="p-1.5 rounded-lg transition-colors bg-red-50 hover:bg-red-100"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel</TooltipContent>
                    </Tooltip>
                    <div className="flex items-center gap-[2px] px-2">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-[2px] bg-red-400 rounded-full origin-center"
                          style={{
                            height: '16px',
                            animation: 'audioWave 0.6s ease-in-out infinite',
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleMicClick}
                          className="p-1.5 rounded-lg transition-colors bg-green-50 hover:bg-green-100"
                        >
                          <Check size={16} className="text-green-600" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Done</TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleMicClick}
                        className="p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-100"
                      >
                        <Mic size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Speak</TooltipContent>
                  </Tooltip>
                )
              )}
              <button 
                onClick={onGenerate}
                disabled={!prompt.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  prompt.trim() 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-emerald-500/40 text-white/70 cursor-not-allowed'
                }`}
              >
                <Send size={16} />
                <span>Generate For Free!</span>
              </button>
            </div>
          </div>
        </div>

        {/* Type Dropdown Panel */}
        {showTypeDropdown && showSubTypeSelector && (
          <div className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-200 rounded-2xl shadow-lg p-5 z-50">
            <div className="grid grid-cols-4 gap-x-6 gap-y-3">
              {getSubTypeOptions().map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSubTypeSelect(option)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <option.icon size={18} className={option.color} />
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVAPromptBox;
