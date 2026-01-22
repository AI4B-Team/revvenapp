import { Cpu } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const IMAGE_MODELS = [
  { value: 'auto', label: 'Auto (Nano Banana Pro)' },
  { value: 'flux-pro', label: 'Flux Pro' },
  { value: 'flux-max', label: 'Flux Max' },
  { value: 'gpt-4o-image', label: 'GPT-4o Image' },
  { value: 'imagen-ultra', label: 'Imagen 4 Ultra' },
  { value: 'grok', label: 'Grok Imagine' },
  { value: 'qwen', label: 'Qwen Image' },
  { value: 'seedream-4', label: 'Seedream 4.0' },
  { value: 'seedream', label: 'Seedream 3.0' },
  { value: 'nano-banana-pro', label: 'Nano Banana Pro' },
  { value: 'z-image', label: 'Z-Image' },
] as const;

export type ImageModelValue = typeof IMAGE_MODELS[number]['value'];

interface ImageModelSelectorProps {
  value: ImageModelValue;
  onChange: (value: ImageModelValue) => void;
}

const ImageModelSelector = ({ value, onChange }: ImageModelSelectorProps) => {
  const selectedModel = IMAGE_MODELS.find(m => m.value === value);
  
  return (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cpu className="w-4 h-4" />
            <span className="font-medium">Model</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Select AI Model</TooltipContent>
      </Tooltip>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_MODELS.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ImageModelSelector;
