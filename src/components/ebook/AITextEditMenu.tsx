import React, { useState } from 'react';
import { 
  Wand2, Sparkles, FileText, ArrowDownToLine, MinusCircle, 
  MessageSquare, Palette, Target, Languages, CheckCircle,
  Loader2, ChevronRight
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

export type AIEditAction = 
  | 'improve-writing'
  | 'fix-spelling'
  | 'make-shorter'
  | 'make-longer'
  | 'change-tone'
  | 'plain-language'
  | 'change-focus'
  | 'simplify';

export const AI_EDIT_OPTIONS: { 
  id: AIEditAction; 
  label: string; 
  icon: typeof Wand2; 
  description: string;
  hasSubmenu?: boolean;
}[] = [
  { 
    id: 'improve-writing', 
    label: 'Improve Writing', 
    icon: Sparkles, 
    description: 'Enhance clarity and flow' 
  },
  { 
    id: 'fix-spelling', 
    label: 'Fix Spelling & Grammar', 
    icon: CheckCircle, 
    description: 'Correct errors automatically' 
  },
  { 
    id: 'make-shorter', 
    label: 'Make Shorter', 
    icon: MinusCircle, 
    description: 'Condense content while keeping meaning' 
  },
  { 
    id: 'make-longer', 
    label: 'Make Longer', 
    icon: ArrowDownToLine, 
    description: 'Expand with more detail' 
  },
  { 
    id: 'change-tone', 
    label: 'Change Tone', 
    icon: Palette, 
    description: 'Adjust writing style',
    hasSubmenu: true
  },
  { 
    id: 'plain-language', 
    label: 'Rewrite in Plain Language', 
    icon: Languages, 
    description: 'Simplify complex text' 
  },
  { 
    id: 'change-focus', 
    label: 'Change Focus', 
    icon: Target, 
    description: 'Shift emphasis or perspective' 
  },
  { 
    id: 'simplify', 
    label: 'Simplify Language', 
    icon: FileText, 
    description: 'Use simpler words and sentences' 
  },
];

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual & Friendly' },
  { id: 'academic', label: 'Academic' },
  { id: 'enthusiastic', label: 'Enthusiastic' },
  { id: 'formal', label: 'Formal' },
  { id: 'conversational', label: 'Conversational' },
];

interface AITextEditMenuProps {
  onAction: (action: AIEditAction, params?: { tone?: string; prompt?: string }) => void;
  isProcessing?: boolean;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const AITextEditMenu: React.FC<AITextEditMenuProps> = ({
  onAction,
  isProcessing = false,
  trigger,
  align = 'start',
  side = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showToneSubmenu, setShowToneSubmenu] = useState(false);

  const handleAction = (action: AIEditAction, params?: { tone?: string }) => {
    onAction(action, params);
    setIsOpen(false);
    setShowToneSubmenu(false);
  };

  const handleCustomPrompt = () => {
    if (customPrompt.trim()) {
      onAction('improve-writing', { prompt: customPrompt });
      setCustomPrompt('');
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors">
            <Wand2 className="w-4 h-4" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0 bg-white border border-gray-200 shadow-xl z-50" 
        side={side}
        align={align}
      >
        {/* Custom Prompt Input */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Modify with a prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customPrompt.trim()) {
                  handleCustomPrompt();
                }
              }}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isProcessing}
            />
            {customPrompt.trim() && (
              <button
                onClick={handleCustomPrompt}
                disabled={isProcessing}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* AI Actions List */}
        <div className="py-1 max-h-80 overflow-y-auto">
          {AI_EDIT_OPTIONS.map((option) => (
            <div key={option.id} className="relative">
              {option.hasSubmenu ? (
                <div
                  className="relative"
                  onMouseEnter={() => setShowToneSubmenu(true)}
                  onMouseLeave={() => setShowToneSubmenu(false)}
                >
                  <button
                    disabled={isProcessing}
                    className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
                  >
                    <option.icon className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {/* Tone Submenu */}
                  {showToneSubmenu && (
                    <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                      {TONE_OPTIONS.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => handleAction('change-tone', { tone: tone.id })}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleAction(option.id)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <option.icon className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Powered by AI • Results may vary
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AITextEditMenu;
