import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Image, Video, Music, Palette, FileText, Calendar, Code, Search, GitCompare, BarChart3, Sparkles, CheckSquare, Map, FileCheck, Clock, Workflow, Target, Zap, Bot, Link } from 'lucide-react';
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
    { id: 'image', label: 'Image', icon: Image, color: 'text-info' },
    { id: 'video', label: 'Video', icon: Video, color: 'text-destructive' },
    { id: 'audio', label: 'Audio', icon: Music, color: 'text-success' },
    { id: 'design', label: 'Design', icon: Palette, color: 'text-warning' },
    { id: 'content', label: 'Content', icon: Calendar, color: 'text-purple-500' },
    { id: 'document', label: 'Document', icon: FileText, color: 'text-info' },
    { id: 'apps', label: 'Apps', icon: Code, color: 'text-destructive' },
  ],
  Research: [
    { id: 'explain', label: 'Explain', icon: Search, color: 'text-info' },
    { id: 'compare', label: 'Compare', icon: GitCompare, color: 'text-accent' },
    { id: 'summarize', label: 'Summarize', icon: FileText, color: 'text-success' },
    { id: 'analyze', label: 'Analyze', icon: BarChart3, color: 'text-warning' },
    { id: 'deep-dive', label: 'Deep Dive', icon: Sparkles, color: 'text-violet-500' },
  ],
  Plan: [
    { id: 'checklist', label: 'Checklist', icon: CheckSquare, color: 'text-success' },
    { id: 'roadmap', label: 'Roadmap', icon: Map, color: 'text-info' },
    { id: 'sop', label: 'SOP', icon: FileCheck, color: 'text-accent' },
    { id: 'timeline', label: 'Timeline', icon: Clock, color: 'text-warning' },
    { id: 'workflow', label: 'Workflow', icon: Workflow, color: 'text-violet-500' },
    { id: 'funnel', label: 'Funnel', icon: Target, color: 'text-primary' },
  ],
  Automate: [
    { id: 'workflow', label: 'Workflow', icon: Workflow, color: 'text-info' },
    { id: 'sop', label: 'SOP', icon: FileCheck, color: 'text-success' },
    { id: 'agent', label: 'Agent', icon: Bot, color: 'text-accent' },
    { id: 'zapier', label: 'Zapier', icon: Zap, color: 'text-warning' },
    { id: 'make', label: 'Make', icon: Link, color: 'text-violet-500' },
    { id: 'api-script', label: 'API / Script', icon: Code, color: 'text-primary' },
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

  // Return null if no intent is selected or if an option is already selected
  if (!intent || selectedOption) {
    return null;
  }

  const options = optionsByIntent[intent];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
          "text-muted-foreground bg-muted hover:bg-border",
          isOpen && "bg-border"
        )}
        title="Let REVVEN decide the best output"
      >
        <Sparkles size={14} />
        Auto
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
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
