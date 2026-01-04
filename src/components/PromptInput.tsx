import { useState, useEffect, useCallback } from 'react';
import { Mic, Send, Sparkles, Video, Pencil, User, Users, RefreshCw, BarChart, BookOpen, Headphones, Image, Layers, Camera, ArrowRightLeft, AudioLines, Music, FileText, CreditCard, ImageIcon, LayoutTemplate, TableCellsMerge, Mail, FolderOpen, Shuffle, LayoutGrid, Box, Brush, Link, Copy, Hash, X, ChevronDown, Monitor, Clock, SlidersHorizontal, Move, Mic2, PenTool } from 'lucide-react';
import IntentSelector, { type Intent } from './IntentSelector';
import AutoDropdown, { type AutoOption } from './AutoDropdown';
import ControlChip from './ControlChip';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { LucideIcon } from 'lucide-react';

const placeholdersByIntent: Record<Intent | 'default', string> = {
  default: 'Ask anything...',
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

// Video type options - matching screenshot exactly
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

// Image type options - matching screenshot exactly
const imageTypes: SubOption[] = [
  { id: 'create', label: 'Create', icon: Sparkles, color: 'text-amber-500' },
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

interface PromptInputProps {
  onGenerate?: () => void;
}

const PromptInput = ({ onGenerate }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [selectedOption, setSelectedOption] = useState<AutoOption | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOption | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Speech recognition hook
  const handleTranscriptResult = useCallback((transcript: string) => {
    setPrompt(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
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
    setShowTypeDropdown(false);
    // Auto-select "Create" subtype when Image is selected
    if (option?.id === 'image') {
      setSelectedSubType(imageTypes[0]); // Select "Create" by default
    } else {
      setSelectedSubType(null);
    }
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
    return imageControlIcons; // Default to image control icons
  };

  const showSubTypeSelector = selectedOption !== null;

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Intent Selector */}
      <IntentSelector selectedIntent={intent} onIntentChange={setIntent} />
      
      {/* Prompt Input Box */}
      <div className="relative w-fit max-w-full mx-auto">
        <div className="bg-white border-2 border-emerald-400 rounded-3xl shadow-sm overflow-visible min-h-[180px] flex flex-col w-fit max-w-full min-w-[340px] sm:min-w-[520px] md:min-w-[640px]">
          {/* Left side icons - only shown when an option is selected */}
          {selectedOption && (
            <div className="flex flex-col gap-1 absolute left-4 top-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className={`p-1.5 rounded-lg bg-slate-100 ${selectedOption.color} hover:bg-slate-200 transition-colors`}>
                    <selectedOption.icon size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{selectedOption.label}</TooltipContent>
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
            <input
              type="text"
              placeholder={placeholdersByIntent[intent || 'default']}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border-none text-base text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Bottom bar - expands dynamically as content is added */}
          <div className="flex items-center justify-between px-4 pb-4 gap-4 flex-nowrap whitespace-nowrap min-w-0">
            {/* Left side controls - flex shrink disabled */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Auto dropdown - only shown when intent is selected AND no option is selected yet */}
              {intent && !selectedOption && (
                <AutoDropdown intent={intent} selectedOption={selectedOption} onSelect={handleOptionSelect} />
              )}
              
              {/* Selected option chip - shown when an option is selected */}
              {selectedOption && (
                <>
                  <ControlChip 
                    label={selectedOption.label} 
                    icon={selectedOption.icon} 
                    iconColor={selectedOption.color} 
                    onRemove={handleRemoveOption} 
                  />

                  {/* Selected sub-type chip OR Type button */}
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

                  {/* Control icons - only shown when sub-type is selected */}
                  {selectedSubType && (
                    <>
                      {/* Vertical divider */}
                      <div className="w-px h-8 bg-slate-200 mx-1 flex-shrink-0" />

                      {/* Control icons with tooltips */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
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

            {/* Right side controls - flex shrink disabled */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
              {/* AI Enhance button - only shown when there's text in prompt */}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleMicClick}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-100 text-red-500' 
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Mic 
                        size={18} 
                        className={isListening ? 'animate-pulse' : ''} 
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isListening ? 'Stop Recording' : 'Speak'}</TooltipContent>
                </Tooltip>
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

        {/* Type Dropdown Panel - below the prompt box */}
        {showTypeDropdown && showSubTypeSelector && (
          <div className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-200 rounded-2xl shadow-lg p-5 z-50">
            <div className="grid grid-cols-4 gap-x-6 gap-y-3">
              {getSubTypeOptions().map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSubTypeSelect(option)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <option.icon size={18} className={option.color} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptInput;
