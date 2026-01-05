import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Image, Video, Music, Palette, FileText, Calendar, Code, Search, GitCompare, BarChart3, Sparkles, CheckSquare, Map, FileCheck, Clock, Workflow, Target, Zap, Bot, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Intent } from './IntentSelector';
import type { LucideIcon } from 'lucide-react';

export interface AutoOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const optionsByIntent: Record<Intent, AutoOption[]> = {
  Create: [
    { id: 'image', label: 'Image', icon: Image, color: 'text-blue-500' },
    { id: 'video', label: 'Video', icon: Video, color: 'text-red-500' },
    { id: 'audio', label: 'Audio', icon: Music, color: 'text-green-500' },
    { id: 'design', label: 'Design', icon: Palette, color: 'text-orange-500' },
    { id: 'content', label: 'Content', icon: Calendar, color: 'text-purple-500' },
    { id: 'document', label: 'Document', icon: FileText, color: 'text-blue-500' },
    { id: 'apps', label: 'Apps', icon: Code, color: 'text-red-500' },
  ],
  Research: [
    { id: 'explain', label: 'Explain', icon: Search, color: 'text-blue-500' },
    { id: 'compare', label: 'Compare', icon: GitCompare, color: 'text-purple-500' },
    { id: 'summarize', label: 'Summarize', icon: FileText, color: 'text-green-500' },
    { id: 'analyze', label: 'Analyze', icon: BarChart3, color: 'text-orange-500' },
    { id: 'deep-dive', label: 'Deep Dive', icon: Sparkles, color: 'text-blue-500' },
  ],
  Plan: [
    { id: 'checklist', label: 'Checklist', icon: CheckSquare, color: 'text-green-500' },
    { id: 'roadmap', label: 'Roadmap', icon: Map, color: 'text-blue-500' },
    { id: 'sop', label: 'SOP', icon: FileCheck, color: 'text-purple-500' },
    { id: 'timeline', label: 'Timeline', icon: Clock, color: 'text-orange-500' },
    { id: 'workflow', label: 'Workflow', icon: Workflow, color: 'text-purple-500' },
    { id: 'funnel', label: 'Funnel', icon: Target, color: 'text-green-500' },
  ],
  Automate: [
    { id: 'workflow', label: 'Workflow', icon: Workflow, color: 'text-red-500' },
    { id: 'sop', label: 'SOP', icon: FileCheck, color: 'text-green-500' },
    { id: 'agent', label: 'Agent', icon: Bot, color: 'text-blue-500' },
    { id: 'zapier', label: 'Zapier', icon: Zap, color: 'text-orange-500' },
    { id: 'make', label: 'Make', icon: Link, color: 'text-purple-500' },
    { id: 'api-script', label: 'API / Script', icon: Code, color: 'text-teal-500' },
  ],
};

interface AutoDropdownProps {
  intent: Intent | null;
  selectedOption: AutoOption | null;
  onSelect: (option: AutoOption | null) => void;
}

const AutoDropdown = ({ intent, selectedOption, onSelect }: AutoDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show Auto dropdown when an intent is selected
  if (!intent) {
    return null;
  }

  const options = optionsByIntent[intent];

  // If an option is selected, show the selected option button
  if (selectedOption) {
    // Map color classes to pastel background colors
    const getPastelBg = (color: string) => {
      if (color.includes('blue')) return 'bg-blue-50 hover:bg-blue-100';
      if (color.includes('red')) return 'bg-red-50 hover:bg-red-100';
      if (color.includes('green')) return 'bg-green-50 hover:bg-green-100';
      if (color.includes('orange')) return 'bg-orange-50 hover:bg-orange-100';
      if (color.includes('purple')) return 'bg-purple-50 hover:bg-purple-100';
      if (color.includes('amber')) return 'bg-amber-50 hover:bg-amber-100';
      if (color.includes('violet')) return 'bg-violet-50 hover:bg-violet-100';
      if (color.includes('cyan')) return 'bg-cyan-50 hover:bg-cyan-100';
      if (color.includes('indigo')) return 'bg-indigo-50 hover:bg-indigo-100';
      if (color.includes('teal')) return 'bg-teal-50 hover:bg-teal-100';
      if (color.includes('emerald')) return 'bg-emerald-50 hover:bg-emerald-100';
      return 'bg-slate-50 hover:bg-slate-100';
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
            getPastelBg(selectedOption.color),
            selectedOption.color.replace('text-', 'border-')
          )}
        >
          <selectedOption.icon size={14} className={selectedOption.color} />
          <span className={selectedOption.color}>{selectedOption.label}</span>
          {isOpen ? <ChevronUp size={14} className={selectedOption.color} /> : <ChevronDown size={14} className={selectedOption.color} />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-[999]">
            {options.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors",
                  selectedOption.id === option.id && "bg-slate-100"
                )}
              >
                <option.icon size={16} className={option.color} />
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
          "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200",
          isOpen && "bg-slate-200"
        )}
      >
        <Sparkles size={14} className="text-emerald-500" />
        Auto
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-[999]">
          {options.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <option.icon size={16} className={option.color} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoDropdown;
