import { useState } from 'react';
import { ArrowUpRight, Upload, ChevronDown, Layers, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import template images
import vinylTemplate from '@/assets/presentation-templates/vinyl.jpg';
import whiteboardTemplate from '@/assets/presentation-templates/whiteboard.jpg';
import groveTemplate from '@/assets/presentation-templates/grove.jpg';
import frescoTemplate from '@/assets/presentation-templates/fresco.jpg';
import easelTemplate from '@/assets/presentation-templates/easel.jpg';
import dioramaTemplate from '@/assets/presentation-templates/diorama.jpg';
import chromaticTemplate from '@/assets/presentation-templates/chromatic.jpg';
import glamourTemplate from '@/assets/presentation-templates/glamour.jpg';

interface SamplePrompt {
  id: string;
  text: string;
}

interface PresentationTemplate {
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

const templates: PresentationTemplate[] = [
  { id: 'vinyl', name: 'Vinyl', image: vinylTemplate, isPopular: true },
  { id: 'whiteboard', name: 'Whiteboard', image: whiteboardTemplate, isPopular: true },
  { id: 'grove', name: 'Grove', image: groveTemplate, isPopular: true },
  { id: 'fresco', name: 'Fresco', image: frescoTemplate },
  { id: 'easel', name: 'Easel', image: easelTemplate, isPopular: true },
  { id: 'diorama', name: 'Diorama', image: dioramaTemplate, isPopular: true },
  { id: 'chromatic', name: 'Chromatic', image: chromaticTemplate, isPopular: true },
  { id: 'glamour', name: 'Glamour', image: glamourTemplate },
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
}

const PresentationTemplates = ({ onPromptSelect, onTemplateSelect }: PresentationTemplatesProps) => {
  const [slideCount, setSlideCount] = useState('8-12');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handlePromptClick = (prompt: SamplePrompt) => {
    onPromptSelect?.(prompt.text);
  };

  const handleTemplateClick = (template: PresentationTemplate) => {
    setSelectedTemplate(template.id);
    onTemplateSelect?.(template);
  };

  return (
    <div className="w-full max-w-[850px] mx-auto mt-6 space-y-6">
      {/* Sample Prompts Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sample prompts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handlePromptClick(prompt)}
              className="group relative p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
            >
              <p className="text-sm text-gray-600 line-clamp-3 pr-5">{prompt.text}</p>
              <ArrowUpRight 
                size={14} 
                className="absolute bottom-3 right-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Choose a Template Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Choose a template</h3>
          <Select value={slideCount} onValueChange={setSlideCount}>
            <SelectTrigger className="w-[120px] h-9 text-sm bg-white border-gray-200">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-gray-500" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
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
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Import Template Card */}
          <button className="group flex flex-col items-center justify-center aspect-[16/10] bg-white border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200">
            <Upload size={24} className="text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-emerald-600 transition-colors">Import template</span>
          </button>

          {/* Template Cards */}
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`group relative flex flex-col overflow-hidden rounded-xl transition-all duration-200 ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-emerald-500 ring-offset-2' 
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-xl">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2">
                <span className="text-sm font-medium text-gray-700">{template.name}</span>
                {template.isPopular && (
                  <span className="text-base">🍌</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationTemplates;
