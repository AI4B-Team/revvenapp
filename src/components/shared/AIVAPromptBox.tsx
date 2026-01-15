import { useState, useEffect, useCallback } from 'react';
import { Mic, Send, Sparkles, Video, Pencil, User, Users, RefreshCw, BarChart, BookOpen, Headphones, Image, Layers, Camera, ArrowRightLeft, AudioLines, Music, FileText, CreditCard, ImageIcon, LayoutTemplate, TableCellsMerge, Mail, FolderOpen, Shuffle, LayoutGrid, Box, Copy, Hash, X, ChevronDown, Monitor, Clock, SlidersHorizontal, Move, PenTool, Check, Search, Kanban, Zap, Brush, type LucideIcon } from 'lucide-react';
import ReferenceLinkIcon from '@/components/icons/ReferenceLinkIcon';
import VideoStyleIcon from '@/components/icons/VideoStyleIcon';
import IntentSelector, { type Intent } from '@/components/IntentSelector';
import AutoDropdown, { type AutoOption } from '@/components/AutoDropdown';
import ControlChip from '@/components/ControlChip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';

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

// Control icons for Image types - uses Brush icon for style
const imageControlIcons: ControlIcon[] = [
  { id: 'style', icon: Brush, tooltip: 'Style' },
  { id: 'character', icon: User, tooltip: 'Character' },
  { id: 'ratio', icon: Copy, tooltip: 'Ratio' },
  { id: 'number', icon: Hash, tooltip: 'Number' },
];

// Control icons for Video types - reference uses custom icon component
const videoControlIcons: ControlIcon[] = [
  { id: 'character', icon: User, tooltip: 'Character' },
  { id: 'ratio', icon: Copy, tooltip: 'Ratio' },
  { id: 'duration', icon: Clock, tooltip: 'Duration' },
  { id: 'quality', icon: SlidersHorizontal, tooltip: 'Quality' },
];

// Control icons for Document types - minimal controls
const documentControlIcons: ControlIcon[] = [];

// Model options based on content type
const imageModelOptions = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best' },
  { id: 'flux-pro', label: 'Flux Pro', description: 'High quality images' },
  { id: 'flux-max', label: 'Flux Max', description: 'Maximum quality' },
  { id: 'gpt-4o-image', label: 'GPT-4o Image', description: 'OpenAI image model' },
  { id: 'seedream-4', label: 'Seedream 4', description: 'Creative styles' },
  { id: 'seedream-4.5', label: 'Seedream 4.5', description: 'Enhanced creative' },
  { id: 'ideogram-character', label: 'Ideogram', description: 'Character consistency' },
];

const videoModelOptions = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best' },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick generation' },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality' },
  { id: 'sora-2-pro', label: 'Sora 2 Pro', description: 'Storyboard mode' },
  { id: 'sora-2-i2v', label: 'Sora 2', description: 'Image-to-video' },
  { id: 'kling-2.1', label: 'Kling 2.1', description: 'Supports people' },
  { id: 'kling-2.5', label: 'Kling 2.5', description: 'Text/image-to-video' },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'With sound' },
  { id: 'wan-2.5', label: 'Wan 2.5', description: 'Image-to-video' },
  { id: 'hailuo-2.3', label: 'Hailuo 2.3', description: 'High quality' },
];

const audioModelOptions = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best' },
  { id: 'elevenlabs', label: 'ElevenLabs', description: 'Premium voices' },
  { id: 'kie-ai', label: 'KIE.AI', description: 'Fast generation' },
  { id: 'openai-tts', label: 'OpenAI TTS', description: 'Natural voices' },
];

const designModelOptions = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best' },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google AI' },
  { id: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI model' },
];

const documentModelOptions = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best' },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google AI' },
  { id: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI model' },
  { id: 'claude-3.5', label: 'Claude 3.5', description: 'Anthropic model' },
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

export interface SubOptionType {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

// Ratio options
const ratioOptions = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'];
// Number options
const numberOptions = [1, 2, 4, 8];
// Duration options
const durationOptions = ['5s', '10s', '15s', '30s', '60s'];
// Quality options
const qualityOptions = ['standard', 'high', 'ultra'];

interface AIVAPromptBoxProps {
  onGenerate?: () => void;
  showGreeting?: boolean;
  greetingName?: string;
  showTagline?: boolean;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  selectedIntent?: Intent | null;
  onIntentChange?: (intent: Intent | null) => void;
  onSubTypeChange?: (subType: SubOptionType | null) => void;
  // Control callbacks for opening modals (style and character need external modals)
  onStyleClick?: () => void;
  onCharacterClick?: () => void;
}

const AIVAPromptBox = ({ 
  onGenerate, 
  showGreeting = false, 
  greetingName, 
  showTagline = false,
  prompt: externalPrompt,
  onPromptChange,
  selectedIntent: externalIntent,
  onIntentChange,
  onSubTypeChange,
  onStyleClick,
  onCharacterClick,
}: AIVAPromptBoxProps) => {
  const [internalPrompt, setInternalPrompt] = useState('');
  const [internalIntent, setInternalIntent] = useState<Intent | null>(null);
  
  // Use external state if provided, otherwise use internal
  const prompt = externalPrompt !== undefined ? externalPrompt : internalPrompt;
  const setPrompt = onPromptChange || setInternalPrompt;
  const intent = externalIntent !== undefined ? externalIntent : internalIntent;
  const setIntent = onIntentChange || setInternalIntent;
  const [selectedOption, setSelectedOption] = useState<AutoOption | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOption | null>(null);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState('5s');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  
  // Single state for tracking which dropdown is open (only one at a time)
  type DropdownType = 'type' | 'model' | 'ratio' | 'number' | 'duration' | 'quality' | null;
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  
  // Toggle dropdown - if clicking same one, close it; otherwise open new one
  const toggleDropdown = useCallback((dropdown: DropdownType) => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  }, []);
  
  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

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
    setActiveDropdown(null);
    onSubTypeChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent]);

  // Notify parent when sub-type changes
  useEffect(() => {
    onSubTypeChange?.(selectedSubType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubType]);

  const handleOptionSelect = (option: AutoOption | null) => {
    setSelectedOption(option);
    setSelectedSubType(null);
    setActiveDropdown(null);
  };

  const handleRemoveOption = () => {
    setSelectedOption(null);
    setSelectedSubType(null);
    setActiveDropdown(null);
  };

  const handleRemoveSubType = () => {
    setSelectedSubType(null);
  };

  const handleSubTypeSelect = (subType: SubOption) => {
    setSelectedSubType(subType);
    setActiveDropdown(null);
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
    if (selectedOption?.id === 'document') return documentControlIcons;
    if (selectedOption?.id === 'video') return videoControlIcons;
    return imageControlIcons;
  };

  // Get model options based on selected option type
  const getModelOptions = () => {
    if (selectedOption?.id === 'video') return videoModelOptions;
    if (selectedOption?.id === 'image') return imageModelOptions;
    if (selectedOption?.id === 'audio') return audioModelOptions;
    if (selectedOption?.id === 'design') return designModelOptions;
    if (selectedOption?.id === 'document') return documentModelOptions;
    return imageModelOptions; // default
  };

  const currentModelOptions = getModelOptions();

  // Check if document type is selected (show only Type button initially)
  const isDocumentType = selectedOption?.id === 'document';

  const showSubTypeSelector = selectedOption !== null;

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Headline Section */}
      {showGreeting && (
        <div className="text-center">
          {greetingName && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <span className="text-xl text-muted-foreground font-medium">Hi {greetingName}</span>
            </div>
          )}
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
      <div className="relative mx-auto w-full max-w-[95%] md:max-w-[1400px]" style={{ minWidth: 'min(340px, 100%)' }}>
        <div className="bg-white border-2 border-emerald-400 rounded-3xl shadow-sm min-h-[180px] flex flex-col w-fit min-w-[340px] sm:min-w-[520px] md:min-w-[800px] mx-auto relative">
          {/* Input area */}
          <div className="px-6 pt-5 pb-3 flex-1 flex gap-3 min-w-0">
            {/* Left side icons - only shown when an option is selected */}
            {selectedOption && (
              <div className="flex flex-col gap-1 flex-shrink-0">
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

            <textarea
              placeholder={isListening ? 'Listening...' : placeholdersByIntent[intent || 'default']}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="flex-1 min-w-0 border-none text-base text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Bottom bar */}
          <div className="flex items-center gap-4 flex-wrap px-4 pb-4">
            {/* Left side controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Auto dropdown - visible when intent is selected */}
              {intent && (
                <AutoDropdown intent={intent} selectedOption={selectedOption} onSelect={handleOptionSelect} />
              )}
              
              {/* For Document type: Show Type button directly after Document chip */}
              {selectedOption?.id === 'document' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      onClick={() => toggleDropdown('type')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer",
                        selectedSubType 
                          ? (() => {
                              const color = selectedSubType.color || '';
                              let pastelBg = 'bg-slate-50 hover:bg-slate-100';
                              if (color.includes('blue')) pastelBg = 'bg-blue-50 hover:bg-blue-100';
                              else if (color.includes('red')) pastelBg = 'bg-red-50 hover:bg-red-100';
                              else if (color.includes('green')) pastelBg = 'bg-green-50 hover:bg-green-100';
                              else if (color.includes('orange')) pastelBg = 'bg-orange-50 hover:bg-orange-100';
                              else if (color.includes('purple')) pastelBg = 'bg-purple-50 hover:bg-purple-100';
                              else if (color.includes('amber')) pastelBg = 'bg-amber-50 hover:bg-amber-100';
                              else if (color.includes('violet')) pastelBg = 'bg-violet-50 hover:bg-violet-100';
                              else if (color.includes('cyan')) pastelBg = 'bg-cyan-50 hover:bg-cyan-100';
                              else if (color.includes('indigo')) pastelBg = 'bg-indigo-50 hover:bg-indigo-100';
                              else if (color.includes('teal')) pastelBg = 'bg-teal-50 hover:bg-teal-100';
                              else if (color.includes('emerald')) pastelBg = 'bg-emerald-50 hover:bg-emerald-100';
                              return `${pastelBg} ${selectedSubType.color} ${selectedSubType.color?.replace('text-', 'border-')}`;
                            })()
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                      )}
                    >
                      {selectedSubType ? (
                        <>
                          <selectedSubType.icon size={16} className={selectedSubType.color} />
                          <span>{selectedSubType.label}</span>
                          <ChevronDown size={14} className={selectedSubType.color} />
                        </>
                      ) : (
                        <>
                          <LayoutGrid size={16} className="text-slate-500" />
                          <span>Type</span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Type</TooltipContent>
                </Tooltip>
              )}
              
              {/* Type button - shows after Auto option is selected (for non-document types) */}
              {selectedOption && selectedOption.id !== 'document' && (
                <>
                  {/* Vertical separator between Auto and Type */}
                  <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        onClick={() => toggleDropdown('type')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer",
                          selectedSubType 
                            ? (() => {
                                const color = selectedSubType.color || '';
                                let pastelBg = 'bg-slate-50 hover:bg-slate-100';
                                if (color.includes('blue')) pastelBg = 'bg-blue-50 hover:bg-blue-100';
                                else if (color.includes('red')) pastelBg = 'bg-red-50 hover:bg-red-100';
                                else if (color.includes('green')) pastelBg = 'bg-green-50 hover:bg-green-100';
                                else if (color.includes('orange')) pastelBg = 'bg-orange-50 hover:bg-orange-100';
                                else if (color.includes('purple')) pastelBg = 'bg-purple-50 hover:bg-purple-100';
                                else if (color.includes('amber')) pastelBg = 'bg-amber-50 hover:bg-amber-100';
                                else if (color.includes('violet')) pastelBg = 'bg-violet-50 hover:bg-violet-100';
                                else if (color.includes('cyan')) pastelBg = 'bg-cyan-50 hover:bg-cyan-100';
                                else if (color.includes('indigo')) pastelBg = 'bg-indigo-50 hover:bg-indigo-100';
                                else if (color.includes('teal')) pastelBg = 'bg-teal-50 hover:bg-teal-100';
                                else if (color.includes('emerald')) pastelBg = 'bg-emerald-50 hover:bg-emerald-100';
                                return `${pastelBg} ${selectedSubType.color} ${selectedSubType.color?.replace('text-', 'border-')}`;
                              })()
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                        )}
                      >
                        {selectedSubType ? (
                          <>
                            <selectedSubType.icon size={16} className={selectedSubType.color} />
                            <span>{selectedSubType.label}</span>
                            <ChevronDown size={14} className={selectedSubType.color} />
                          </>
                        ) : (
                          <>
                            <LayoutGrid size={16} className="text-slate-500" />
                            <span>Type</span>
                            <ChevronDown size={14} className="text-slate-400" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Type</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Model and Control icons - visible after Type is selected */}
              {selectedSubType && (
                <>
                  {/* Vertical separator */}
                  <div className="w-px h-8 bg-slate-200 flex-shrink-0" />

                  {/* Model Button with dropdown */}
                  <div className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          onClick={() => toggleDropdown('model')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-sm font-medium transition-colors cursor-pointer"
                        >
                          <Box size={16} className="text-slate-500" />
                          <span>{currentModelOptions.find(m => m.id === selectedModel)?.label || 'Auto'}</span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Model</TooltipContent>
                    </Tooltip>
                    
                    {/* Model Dropdown */}
                    {activeDropdown === 'model' && (
                      <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[180px] max-h-[300px] overflow-y-auto">
                        {currentModelOptions.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setActiveDropdown(null);
                            }}
                            className={cn(
                              "flex flex-col w-full px-3 py-2 rounded-lg text-sm transition-colors text-left",
                              selectedModel === model.id 
                                ? "bg-emerald-50 text-emerald-700" 
                                : "hover:bg-slate-50 text-slate-600"
                            )}
                          >
                            <span className="font-medium">{model.label}</span>
                            <span className="text-xs text-slate-400">{model.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional control icons (if any) - only for non-document types */}
                  {selectedOption?.id !== 'document' && getControlIcons().length > 0 && (
                    <>
                      <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                      <div className="relative flex items-center gap-1.5 flex-shrink-0">
                        {getControlIcons().map((control) => {
                          // Map control id to callback - use internal handlers for dropdowns
                          const getControlClickHandler = () => {
                            switch (control.id) {
                              case 'style': return () => { closeAllDropdowns(); onStyleClick?.(); };
                              case 'character': return () => { closeAllDropdowns(); onCharacterClick?.(); };
                              case 'ratio': return () => toggleDropdown('ratio');
                              case 'number': return () => toggleDropdown('number');
                              case 'duration': return () => toggleDropdown('duration');
                              case 'quality': return () => toggleDropdown('quality');
                              default: return undefined;
                            }
                          };
                          const clickHandler = getControlClickHandler();
                          
                          // Check if this control's dropdown is open
                          const isActive = activeDropdown === control.id;
                          
                          // Get selected value label for display
                          const getSelectedLabel = () => {
                            switch (control.id) {
                              case 'ratio': return selectedRatio;
                              case 'number': return selectedNumber.toString();
                              case 'duration': return selectedDuration;
                              case 'quality': return selectedQuality.charAt(0).toUpperCase() + selectedQuality.slice(1);
                              default: return null;
                            }
                          };
                          const selectedLabel = getSelectedLabel();
                          const hasSelection = selectedLabel && ['ratio', 'number', 'duration', 'quality'].includes(control.id);
                          
                          return (
                            <Tooltip key={control.id}>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={clickHandler}
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-xl transition-colors border",
                                    hasSelection ? "px-3 py-2" : "p-2",
                                    isActive 
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600 border-slate-200"
                                  )}
                                >
                                  <control.icon size={18} />
                                  {hasSelection && (
                                    <span className="text-sm font-medium">{selectedLabel}</span>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>{control.tooltip}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                        
                        {/* Dropdowns - rendered inside the relative container */}
                        {activeDropdown === 'ratio' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[100px]">
                            {ratioOptions.map((ratio) => (
                              <button
                                key={ratio}
                                onClick={() => {
                                  setSelectedRatio(ratio);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                  selectedRatio === ratio ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {activeDropdown === 'number' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[80px]">
                            {numberOptions.map((num) => (
                              <button
                                key={num}
                                onClick={() => {
                                  setSelectedNumber(num);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                  selectedNumber === num ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {activeDropdown === 'duration' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[80px]">
                            {durationOptions.map((dur) => (
                              <button
                                key={dur}
                                onClick={() => {
                                  setSelectedDuration(dur);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                  selectedDuration === dur ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {dur}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {activeDropdown === 'quality' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[100px]">
                            {qualityOptions.map((quality) => (
                              <button
                                key={quality}
                                onClick={() => {
                                  setSelectedQuality(quality);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left capitalize",
                                  selectedQuality === quality ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {quality}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right side controls */}
            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors",
                      !prompt.trim() && "opacity-0 pointer-events-none"
                    )}
                  >
                    <Sparkles size={16} className="text-violet-500" />
                    <span>AI</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Enhance Prompt</TooltipContent>
              </Tooltip>
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
                        className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
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
        {activeDropdown === 'type' && showSubTypeSelector && (
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
