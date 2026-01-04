import { useState, useEffect } from 'react';
import { Mic, Send, Sparkles, Video, Pencil, Mic2, Move, User, Users, RefreshCw, BarChart, BookOpen, Headphones, Presentation, Image, Layers, Camera, ArrowRightLeft, AudioLines, Music, FileText, CreditCard, ImageIcon, LayoutTemplate, TableCellsMerge, Mail, FolderOpen, Shuffle, LayoutGrid } from 'lucide-react';
import IntentSelector, { type Intent } from './IntentSelector';
import AutoDropdown, { type AutoOption } from './AutoDropdown';
import ControlChip from './ControlChip';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
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

// Video type options
const videoTypes: SubOption[] = [
  { id: 'story', label: 'Story', icon: BookOpen, color: 'text-indigo-500' },
  { id: 'presentation', label: 'Presentation', icon: Presentation, color: 'text-teal-500' },
  { id: 'vsl', label: 'VSL', icon: BarChart, color: 'text-red-500' },
  { id: 'avatar', label: 'Avatar', icon: User, color: 'text-emerald-500' },
  { id: 'ugc', label: 'UGC', icon: Users, color: 'text-amber-500' },
  { id: 'recast', label: 'Recast', icon: RefreshCw, color: 'text-cyan-500' },
  { id: 'animate', label: 'Animate', icon: Video, color: 'text-violet-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'lip-sync', label: 'Lip-Sync', icon: Mic2, color: 'text-rose-500' },
  { id: 'motion-sync', label: 'Motion-Sync', icon: Move, color: 'text-blue-500' },
  { id: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-purple-500' },
];

// Image type options - matching screenshot exactly
const imageTypes: SubOption[] = [
  { id: 'create', label: 'Create', icon: Sparkles, color: 'text-amber-500' },
  { id: 'batch', label: 'Batch', icon: Layers, color: 'text-emerald-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'swap', label: 'Swap', icon: ArrowRightLeft, color: 'text-blue-500' },
  { id: 'photoshoot', label: 'Photoshoot', icon: Camera, color: 'text-rose-500' },
];

// Audio type options
const audioTypes: SubOption[] = [
  { id: 'voiceover', label: 'Voiceover', icon: Mic, color: 'text-emerald-500' },
  { id: 'clone', label: 'Clone', icon: User, color: 'text-violet-500' },
  { id: 'revoice', label: 'Revoice', icon: RefreshCw, color: 'text-cyan-500' },
  { id: 'sound-effects', label: 'Sound Effects', icon: AudioLines, color: 'text-rose-500' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-blue-500' },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones, color: 'text-indigo-500' },
];

// Design type options
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
  { id: 'cover-letter', label: 'Cover Letter', icon: FileText, color: 'text-rose-500' },
  { id: 'presentation', label: 'Presentation', icon: Presentation, color: 'text-orange-500' },
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

  const showSubTypeSelector = selectedOption !== null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Intent Selector */}
      <IntentSelector selectedIntent={intent} onIntentChange={setIntent} />
      
      {/* Prompt Input Box */}
      <div className="relative">
        <div className="bg-white border-2 border-emerald-400 rounded-3xl shadow-sm overflow-visible min-h-[180px] flex flex-col">
          {/* Left side icons - only shown when an option is selected */}
          {selectedOption && (
            <div className="flex flex-col gap-1 absolute left-4 top-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className={`p-1.5 rounded-lg ${selectedOption.color} hover:bg-slate-50 transition-colors`}>
                    <selectedOption.icon size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{selectedOption.label}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-lg text-emerald-500 hover:bg-slate-50 transition-colors">
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

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
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

                  {/* Vertical divider */}
                  <div className="w-px h-8 bg-slate-200 mx-1" />

                  {/* Type button */}
                  <button 
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-medium transition-colors"
                  >
                    <LayoutGrid size={16} className="text-slate-500" />
                    <span>Type</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                    <Mic size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Speak</TooltipContent>
              </Tooltip>
              <button 
                onClick={onGenerate}
                disabled={!prompt.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
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
          <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-lg p-4">
            <div className="grid grid-cols-4 gap-2">
              {getSubTypeOptions().map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSubTypeSelect(option)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
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
