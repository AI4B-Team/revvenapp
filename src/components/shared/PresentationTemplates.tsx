import { useState } from 'react';
import { ArrowUpRight, Upload, ChevronLeft, ChevronRight, Layers, Sparkles, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Import template images - Page 1
import vinylTemplate from '@/assets/presentation-templates/vinyl.jpg';
import whiteboardTemplate from '@/assets/presentation-templates/whiteboard.jpg';
import groveTemplate from '@/assets/presentation-templates/grove.jpg';
import frescoTemplate from '@/assets/presentation-templates/fresco.jpg';
import easelTemplate from '@/assets/presentation-templates/easel.jpg';
import dioramaTemplate from '@/assets/presentation-templates/diorama.jpg';
import chromaticTemplate from '@/assets/presentation-templates/chromatic.jpg';
import glamourTemplate from '@/assets/presentation-templates/glamour.jpg';
import amberTemplate from '@/assets/presentation-templates/amber.jpg';
import arcticTemplate from '@/assets/presentation-templates/arctic.jpg';
import ceruleanTemplate from '@/assets/presentation-templates/cerulean.jpg';
// Import template images - Page 2
import cobaltTemplate from '@/assets/presentation-templates/cobalt.jpg';
import emeraldTemplate from '@/assets/presentation-templates/emerald.jpg';
import sketchTemplate from '@/assets/presentation-templates/sketch.jpg';
import basaltTemplate from '@/assets/presentation-templates/basalt.jpg';
import mistTemplate from '@/assets/presentation-templates/mist.jpg';
import onyxTemplate from '@/assets/presentation-templates/onyx.jpg';
import sandTemplate from '@/assets/presentation-templates/sand.jpg';
import neonTemplate from '@/assets/presentation-templates/neon.jpg';
import linenTemplate from '@/assets/presentation-templates/linen.jpg';
import alabasterTemplate from '@/assets/presentation-templates/alabaster.jpg';
import patinaTemplate from '@/assets/presentation-templates/patina.jpg';
import quartzTemplate from '@/assets/presentation-templates/quartz.jpg';

interface SamplePrompt {
  id: string;
  text: string;
}

export interface PresentationTemplate {
  id: string;
  name: string;
  image: string;
  isPopular?: boolean;
}

const samplePrompts: SamplePrompt[] = [
  { id: '1', text: 'Prepare a training module on cybersecurity best practices' },
  { id: '2', text: 'Create a presentation on the impact of AI on the future of work' },
  { id: '3', text: 'Design a pitch deck for a startup seeking funding' },
  { id: '4', text: 'Create a sales presentation for a B2B software solution' },
];

// Page 1: 11 templates (+ Import Template card = 12 total)
const templatesPage1: PresentationTemplate[] = [
  { id: 'vinyl', name: 'Vinyl', image: vinylTemplate, isPopular: true },
  { id: 'whiteboard', name: 'Whiteboard', image: whiteboardTemplate, isPopular: true },
  { id: 'grove', name: 'Grove', image: groveTemplate, isPopular: true },
  { id: 'fresco', name: 'Fresco', image: frescoTemplate },
  { id: 'easel', name: 'Easel', image: easelTemplate, isPopular: true },
  { id: 'diorama', name: 'Diorama', image: dioramaTemplate, isPopular: true },
  { id: 'chromatic', name: 'Chromatic', image: chromaticTemplate, isPopular: true },
  { id: 'glamour', name: 'Glamour', image: glamourTemplate },
  { id: 'amber', name: 'Amber', image: amberTemplate },
  { id: 'arctic', name: 'Arctic', image: arcticTemplate },
  { id: 'cerulean', name: 'Cerulean', image: ceruleanTemplate },
];

// Page 2: 12 templates
const templatesPage2: PresentationTemplate[] = [
  { id: 'cobalt', name: 'Cobalt', image: cobaltTemplate },
  { id: 'emerald', name: 'Emerald', image: emeraldTemplate, isPopular: true },
  { id: 'sketch', name: 'Sketch', image: sketchTemplate },
  { id: 'basalt', name: 'Basalt', image: basaltTemplate },
  { id: 'mist', name: 'Mist', image: mistTemplate },
  { id: 'onyx', name: 'Onyx', image: onyxTemplate },
  { id: 'sand', name: 'Sand', image: sandTemplate },
  { id: 'neon', name: 'Neon', image: neonTemplate, isPopular: true },
  { id: 'linen', name: 'Linen', image: linenTemplate },
  { id: 'alabaster', name: 'Alabaster', image: alabasterTemplate },
  { id: 'patina', name: 'Patina', image: patinaTemplate },
  { id: 'quartz', name: 'Quartz', image: quartzTemplate },
];

const slideCountOptions = [
  { value: '4-8', label: '4 - 8' },
  { value: '8-12', label: '8 - 12' },
  { value: '12-16', label: '12 - 16', isPro: true },
  { value: '16-20', label: '16 - 20', isPro: true },
  { value: '20-24', label: '20 - 24', isPro: true },
];

interface PresentationTemplatesProps {
  onPromptSelect?: (prompt: string) => void;
  onTemplateSelect?: (template: PresentationTemplate) => void;
  onSlideCountChange?: (count: string) => void;
}

const PresentationTemplates = ({ onPromptSelect, onTemplateSelect, onSlideCountChange }: PresentationTemplatesProps) => {
  const [slideCount, setSlideCount] = useState('8-12');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  const handlePromptClick = (prompt: SamplePrompt) => {
    onPromptSelect?.(prompt.text);
  };

  const handleTemplateClick = (template: PresentationTemplate) => {
    setSelectedTemplate(template.id);
    onTemplateSelect?.(template);
  };

  const handleSlideCountChange = (value: string) => {
    setSlideCount(value);
    onSlideCountChange?.(value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentTemplates = currentPage === 1 ? templatesPage1 : templatesPage2;

  return (
    <div className="w-full max-w-[850px] mx-auto mt-6 space-y-6">
      {/* Sample Prompts Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Sample Prompts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handlePromptClick(prompt)}
              className="group relative p-4 text-left bg-card border border-border rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
            >
              <p className="text-sm text-muted-foreground line-clamp-3 pr-5">{prompt.text}</p>
              <ArrowUpRight 
                size={14} 
                className="absolute bottom-3 right-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Choose A Template Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Choose A Template</h3>
          <div className="flex items-center gap-2">
            <Select value={slideCount} onValueChange={handleSlideCountChange}>
              <SelectTrigger className="w-[120px] h-9 text-sm bg-card border-border">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {slideCountOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {option.label}
                      {option.isPro && (
                        <Sparkles size={12} className="text-violet-500" />
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Pagination Arrows */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                currentPage === 1
                  ? "border-border text-muted-foreground/40 cursor-not-allowed"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                currentPage === totalPages
                  ? "border-border text-muted-foreground/40 cursor-not-allowed"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Import Template Card - Only on page 1 */}
          {currentPage === 1 && (
            <button className="group flex flex-col items-center justify-center aspect-[16/10] bg-card border-2 border-dashed border-border rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-200">
              <Upload size={24} className="text-muted-foreground group-hover:text-emerald-500 mb-2 transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Import Template</span>
            </button>
          )}

          {/* Template Cards */}
          {currentTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl transition-all duration-200 bg-card",
                selectedTemplate === template.id 
                  ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background' 
                  : 'hover:shadow-lg'
              )}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-t-xl relative">
                <img
                  src={template.image}
                  alt={template.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {selectedTemplate === template.id && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={18} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2">
                <span className="text-sm font-medium text-foreground">{template.name}</span>
                {template.isPopular && (
                  <span className="text-base">🔥</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Page Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentPage === i + 1
                  ? "bg-emerald-500"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationTemplates;
