import { useState, useEffect } from 'react';
import { Mic, Send, ChevronDown, Sparkles, Video, Pencil, Mic2, Move, User, Users, RefreshCw, BarChart, BookOpen, Headphones, Presentation, Image, Wand2, Layers, Camera, ArrowRightLeft, AudioLines, Music, FileText, CreditCard, ImageIcon, LayoutTemplate, TableCellsMerge, Mail, Share2, Briefcase, ClipboardList, FileCheck, FolderOpen, Box, Paintbrush, UserCircle, Link, Ratio, Hash, Clock, Settings2, Languages, Volume2, Gauge, MessageSquare, Upload, Captions, LayoutGrid } from 'lucide-react';
import IntentSelector, { type Intent, type CreateTab } from './IntentSelector';
import AutoDropdown, { type AutoOption } from './AutoDropdown';
import ControlChip from './ControlChip';
import BuilderPanel from './BuilderPanel';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from 'lucide-react';

// Control button type
interface ControlButton {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Control buttons for different modes
const imageControls: ControlButton[] = [
  { id: 'model', label: 'Model', icon: Box },
  { id: 'style', label: 'Style', icon: Paintbrush },
  { id: 'character', label: 'Character', icon: UserCircle },
  { id: 'reference', label: 'Reference', icon: Link },
  { id: 'ratio', label: 'Ratio', icon: Ratio },
  { id: 'number', label: 'Number', icon: Hash },
];

const videoControls: ControlButton[] = [
  { id: 'model', label: 'Model', icon: Box },
  { id: 'character', label: 'Character', icon: UserCircle },
  { id: 'reference', label: 'Reference', icon: Link },
  { id: 'ratio', label: 'Ratio', icon: Ratio },
  { id: 'duration', label: 'Duration', icon: Clock },
  { id: 'quality', label: 'Quality', icon: Settings2 },
];

const audioControls: ControlButton[] = [
  { id: 'model', label: 'Model', icon: Box },
];

const voiceoverControls: ControlButton[] = [
  { id: 'model', label: 'Model', icon: Box },
  { id: 'character', label: 'Character', icon: UserCircle },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'accent', label: 'Accent', icon: Volume2 },
  { id: 'speed', label: 'Speed', icon: Gauge },
  { id: 'tone', label: 'Tone', icon: MessageSquare },
];

const transcribeControls: ControlButton[] = [
  { id: 'source', label: 'Source', icon: Upload },
];

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

// Video type options matching the screenshot with colors - grouped by category
const videoTypesNarrative: SubOption[] = [
  { id: 'story', label: 'Story', icon: BookOpen, color: 'text-indigo-500' },
  { id: 'presentation', label: 'Presentation', icon: Presentation, color: 'text-teal-500' },
  { id: 'vsl', label: 'VSL', icon: BarChart, color: 'text-red-500' },
];

const videoTypesSocialPersona: SubOption[] = [
  { id: 'avatar', label: 'Avatar', icon: User, color: 'text-emerald-500' },
  { id: 'ugc', label: 'UGC', icon: Users, color: 'text-amber-500' },
  { id: 'recast', label: 'Recast', icon: RefreshCw, color: 'text-cyan-500' },
];

const videoTypesTechnical: SubOption[] = [
  { id: 'animate', label: 'Animate', icon: Video, color: 'text-violet-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'lip-sync', label: 'Lip-Sync', icon: Mic2, color: 'text-rose-500' },
  { id: 'motion-sync', label: 'Motion-Sync', icon: Move, color: 'text-blue-500' },
];

const videoTypesAudioFirst: SubOption[] = [
  { id: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-purple-500' },
];

// All video types combined for iteration
const videoTypes: SubOption[] = [
  ...videoTypesNarrative,
  ...videoTypesSocialPersona,
  ...videoTypesTechnical,
  ...videoTypesAudioFirst,
];

// Image type options with colors
const imageTypes: SubOption[] = [
  { id: 'create', label: 'Create', icon: Sparkles, color: 'text-yellow-500' },
  { id: 'batch', label: 'Batch', icon: Layers, color: 'text-blue-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'swap', label: 'Swap', icon: ArrowRightLeft, color: 'text-purple-500' },
  { id: 'photoshoot', label: 'Photoshoot', icon: Camera, color: 'text-fuchsia-500' },
];

// Audio type options with colors
const audioTypes: SubOption[] = [
  { id: 'voiceover', label: 'Voiceover', icon: Mic, color: 'text-emerald-500' },
  { id: 'clone', label: 'Clone', icon: User, color: 'text-violet-500' },
  { id: 'revoice', label: 'Revoice', icon: RefreshCw, color: 'text-cyan-500' },
  { id: 'transcribe', label: 'Transcribe', icon: Captions, color: 'text-amber-500' },
  { id: 'sound-effects', label: 'Sound Effects', icon: AudioLines, color: 'text-rose-500' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-blue-500' },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones, color: 'text-indigo-500' },
];

// Design type options with colors
const designTypes: SubOption[] = [
  { id: 'brochure', label: 'Brochure', icon: FolderOpen, color: 'text-emerald-500' },
  { id: 'business-card', label: 'Business Card', icon: CreditCard, color: 'text-purple-500' },
  { id: 'cover', label: 'Cover', icon: ImageIcon, color: 'text-blue-500' },
  { id: 'flyer', label: 'Flyer', icon: FileText, color: 'text-amber-500' },
  { id: 'infographic', label: 'Infographic', icon: TableCellsMerge, color: 'text-fuchsia-500' },
  { id: 'invitation', label: 'Invitation', icon: Mail, color: 'text-cyan-500' },
  { id: 'logo', label: 'Logo', icon: Sparkles, color: 'text-yellow-500' },
  { id: 'poster', label: 'Poster', icon: LayoutTemplate, color: 'text-indigo-500' },
  { id: 'thumbnail', label: 'Thumbnail', icon: ImageIcon, color: 'text-rose-500' },
];

// Content type options with colors
const contentTypes: SubOption[] = [
  { id: 'social', label: 'Social', icon: Share2, color: 'text-blue-500' },
];

// Document type options with colors
const documentTypes: SubOption[] = [
  { id: 'ebook', label: 'Ebook', icon: BookOpen, color: 'text-amber-500' },
  { id: 'whitepaper', label: 'Whitepaper', icon: FileCheck, color: 'text-slate-500' },
  { id: 'report', label: 'Report', icon: TableCellsMerge, color: 'text-blue-500' },
  { id: 'business-plan', label: 'Business Plan', icon: Briefcase, color: 'text-indigo-500' },
  { id: 'handbook', label: 'Handbook', icon: BarChart, color: 'text-emerald-500' },
  { id: 'proposal', label: 'Proposal', icon: ClipboardList, color: 'text-purple-500' },
  { id: 'case-study', label: 'Case Study', icon: FileCheck, color: 'text-teal-500' },
  { id: 'cover-letter', label: 'Cover Letter', icon: FileText, color: 'text-rose-500' },
  { id: 'presentation', label: 'Presentation', icon: Presentation, color: 'text-orange-500' },
];

interface PromptInputProps {
  onGenerate?: () => void;
  showTabs?: boolean;
}

const PromptInput = ({ onGenerate, showTabs = true }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [createTab, setCreateTab] = useState<CreateTab>('Apps');
  const [selectedOption, setSelectedOption] = useState<AutoOption | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOption | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Reset chips when intent changes, but preserve typed text
  useEffect(() => {
    setSelectedOption(null);
    setSelectedSubType(null);
  }, [intent]);

  const handleOptionSelect = (option: AutoOption | null) => {
    setSelectedOption(option);
    setSelectedSubType(null);
  };

  const handleRemoveOption = () => {
    setSelectedOption(null);
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

  // Get control buttons based on selected option and sub-type
  const getControlButtons = (): ControlButton[] => {
    if (selectedOption?.id === 'image' && selectedSubType) {
      return imageControls;
    }
    if (selectedOption?.id === 'video' && selectedSubType) {
      return videoControls;
    }
    if (selectedOption?.id === 'audio') {
      if (selectedSubType?.id === 'voiceover') {
        return voiceoverControls;
      }
      if (selectedSubType?.id === 'transcribe') {
        return transcribeControls;
      }
      if (selectedSubType) {
        return audioControls;
      }
    }
    return [];
  };

  const controlButtons = getControlButtons();
  const showSubTypeSelector = selectedOption !== null;
  const hasPromptText = prompt.length > 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
        <IntentSelector selectedIntent={intent} onIntentChange={setIntent} />
        
        <div className="relative">
          <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
            {/* Top-left icons - shown when option is selected */}
            {selectedOption && (
              <div className="flex items-center gap-2 px-4 pt-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-border transition-colors">
                      <ImageIcon size={16} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedOption.id === 'video' ? 'Video-To-Video' : selectedOption.id === 'image' ? 'Image-To-Image' : `${selectedOption.label} Mode`}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-border transition-colors">
                      <Wand2 size={16} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Auto Prompt</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            <div className="px-4 py-2">
              <textarea
                placeholder={placeholdersByIntent[intent ?? 'default']}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className="w-full border-none text-base text-foreground bg-transparent font-body focus:outline-none placeholder:text-muted-foreground pt-2 resize-none min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Auto dropdown or selected chip */}
                <AutoDropdown intent={intent} selectedOption={selectedOption} onSelect={handleOptionSelect} />
                
                {/* Selected option chip */}
                {selectedOption && (
                  <ControlChip
                    label={selectedOption.label}
                    icon={selectedOption.icon}
                    iconColor={selectedOption.color}
                    onRemove={handleRemoveOption}
                  />
                )}

                {/* Vertical separator - only after Type button shows up */}
                {showSubTypeSelector && (
                  <div className="w-px h-6 bg-border mx-1" />
                )}
                
                {/* Sub-type selector with Type icon */}
                {showSubTypeSelector && !selectedSubType && (
                  <div className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-muted-foreground bg-muted hover:bg-border transition-colors"
                        >
                          <ChevronDown size={14} />
                          Type
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{selectedOption?.id === 'video' ? 'Video Type' : 
                          selectedOption?.id === 'image' ? 'Image Type' : 
                          selectedOption?.id === 'content' ? 'Content Type' : 
                          selectedOption?.id === 'document' ? 'Document Type' : 
                          selectedOption?.id === 'audio' ? 'Audio Type' : 
                          selectedOption?.id === 'design' ? 'Design Type' : 'Type'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {/* Sub-type chip - clickable to show dropdown */}
                {selectedSubType && (
                  <ControlChip
                    label={selectedSubType.label}
                    icon={selectedSubType.icon}
                    iconColor={selectedSubType.color}
                    onRemove={() => setSelectedSubType(null)}
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  />
                )}

                {/* Conditional control buttons based on selection - icons only with tooltips */}
                {controlButtons.length > 0 && (
                  <>
                    <div className="w-px h-6 bg-border mx-1" />
                    {controlButtons.map((control) => (
                      <Tooltip key={control.id}>
                        <TooltipTrigger asChild>
                          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-border transition-colors">
                            <control.icon size={16} className="text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{control.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Enhance Prompt icon - only shows when there's text */}
                {hasPromptText && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors">
                        <Sparkles size={14} className="text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-600">AI</span>
                        <ChevronDown size={12} className="text-yellow-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance Prompt</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-border transition-colors">
                      <Mic size={18} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Speak</p>
                  </TooltipContent>
                </Tooltip>
                <button
                  onClick={onGenerate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    prompt.length > 0 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-emerald-100 hover:bg-emerald-200 opacity-70'
                  }`}
                >
                  <Send size={16} className={prompt.length > 0 ? 'text-primary-foreground' : 'text-muted-foreground'} />
                  <span className={`${prompt.length > 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Generate For Free!</span>
                </button>
              </div>
            </div>
          </div>

          {/* Type Dropdown Panel - same width as prompt box */}
          {showTypeDropdown && showSubTypeSelector && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-3 max-h-80 overflow-y-auto">
              {selectedOption?.id === 'video' ? (
                <div className="grid grid-cols-4 gap-2">
                  {[...videoTypesNarrative, ...videoTypesSocialPersona, ...videoTypesTechnical, ...videoTypesAudioFirst].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSubTypeSelect(option)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <option.icon size={18} className={option.color} />
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {getSubTypeOptions().map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSubTypeSelect(option)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <option.icon size={18} className={option.color} />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Tabs - shown below prompt box when Create is selected */}
          {showTabs && intent === 'Create' && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {(['Apps', 'Creations', 'Templates', 'Community', 'Collections'] as CreateTab[]).map((tab) => {
                  const isActive = createTab === tab;
                  const tabIcons: Record<CreateTab, React.ReactNode> = {
                    Apps: <LayoutGrid size={16} />,
                    Creations: <Sparkles size={16} />,
                    Templates: <LayoutTemplate size={16} />,
                    Community: <Users size={16} />,
                    Collections: <FolderOpen size={16} />,
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setCreateTab(tab)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-background border border-border text-muted-foreground hover:border-muted-foreground/50"
                      }`}
                    >
                      {tabIcons[tab]}
                      {tab}
                    </button>
                  );
                })}
              </div>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                See All
                <ChevronDown size={14} />
              </button>
            </div>
          )}

          {/* Builder Panel */}
          <BuilderPanel type={selectedOption?.id as 'video' | 'document' | null} subType={selectedSubType?.id ?? null} />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PromptInput;
