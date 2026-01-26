import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AITextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  context?: string; // Context for AI generation (e.g., "app name", "product description")
  multiline?: boolean;
  className?: string;
  rows?: number;
  productName?: string; // Optional product name for better context
}

const getPromptForContext = (context: string, productName?: string): string => {
  const product = productName || 'the product';
  
  const prompts: Record<string, string> = {
    badge: `Generate a short, compelling badge text (2-4 words max) for ${product}. Examples: "AI-Powered", "#1 Rated", "Award Winning". Return only the badge text, nothing else.`,
    headline: `Generate a hypnotic, scroll-stopping headline (under 80 characters) for ${product}. It should be compelling and create urgency. Return only the headline, nothing else.`,
    tagline: `Generate a catchy tagline (under 60 characters) for ${product}. It should be memorable and communicate value. Return only the tagline, nothing else.`,
    description: `Generate a compelling product description (under 300 characters) for ${product}. Highlight benefits and value proposition. Return only the description, nothing else.`,
    feature_title: `Generate a compelling feature title (2-4 words) for ${product}. Return only the title, nothing else.`,
    feature_description: `Generate a brief feature description (under 100 characters) for ${product}. Return only the description, nothing else.`,
    capability_title: `Generate a capability title (2-4 words) for ${product}. Return only the title, nothing else.`,
    capability_description: `Generate a brief capability description (under 100 characters) for ${product}. Return only the description, nothing else.`,
    testimonial_quote: `Generate a realistic testimonial quote (under 150 characters) for ${product}. Make it sound authentic and highlight positive results. Return only the quote, nothing else.`,
    cta_headline: `Generate a compelling call-to-action headline (under 60 characters) for ${product}. Return only the headline, nothing else.`,
    subheadline: `Generate a persuasive subheadline (under 80 characters) for ${product}. Return only the subheadline, nothing else.`,
    button_text: `Generate compelling button text (2-4 words) for ${product}. Return only the button text, nothing else.`,
    faq_question: `Generate a common FAQ question (under 60 characters) for ${product}. Return only the question, nothing else.`,
    faq_answer: `Generate a helpful FAQ answer (under 200 characters) for ${product}. Return only the answer, nothing else.`,
    order_bump_headline: `Generate an irresistible order bump headline (under 50 characters) for an add-on to ${product}. Return only the headline, nothing else.`,
    order_bump_description: `Generate a compelling order bump description (under 150 characters) that explains the value of an add-on to ${product}. Return only the description, nothing else.`,
    guarantee_description: `Generate a trust-building guarantee description (under 80 characters) for ${product}. Return only the description, nothing else.`,
    spotlight_item: `Generate a compelling "what you get" item (under 50 characters) for ${product}. Return only the item text, nothing else.`,
    default: `Generate compelling marketing copy (under 150 characters) for ${product}. Return only the text, nothing else.`,
  };

  const contextKey = context.toLowerCase().replace(/\s+/g, '_');
  return prompts[contextKey] || prompts.default;
};

const getEnhancePrompt = (text: string, context: string): string => {
  const contextKey = context.toLowerCase().replace(/\s+/g, '_');
  
  const maxLengths: Record<string, number> = {
    badge: 20,
    headline: 80,
    tagline: 60,
    description: 300,
    button_text: 20,
    default: 150,
  };
  
  const maxLength = maxLengths[contextKey] || maxLengths.default;
  
  return `Enhance and improve this marketing text while keeping it under ${maxLength} characters. Make it more compelling, clear, and persuasive. Original text: "${text}". Return only the enhanced text, nothing else.`;
};

const AITextInput: React.FC<AITextInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  context = '',
  multiline = false,
  className = '',
  rows = 3,
  productName,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = getPromptForContext(context, productName);
      
      const { data, error } = await supabase.functions.invoke('editor-generate-text', {
        body: { prompt, type: context }
      });

      if (error) {
        console.error('AI generation error:', error);
        throw new Error(error.message || 'Generation failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.text) {
        onChange(data.text);
        toast.success('Content generated!');
      } else {
        throw new Error('No content generated');
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!value.trim()) {
      toast.error('Please write something first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const prompt = getEnhancePrompt(value, context);
      
      const { data, error } = await supabase.functions.invoke('editor-generate-text', {
        body: { prompt, type: `enhance_${context}` }
      });

      if (error) {
        console.error('AI enhancement error:', error);
        throw new Error(error.message || 'Enhancement failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.text) {
        onChange(data.text);
        toast.success('Content enhanced!');
      } else {
        throw new Error('No content generated');
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error(error instanceof Error ? error.message : 'Enhancement failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="relative w-full">
      {label && (
        <label className="text-sm font-medium mb-1.5 block">{label}</label>
      )}
      <div className="relative group">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${className}`}
          rows={multiline ? rows : undefined}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-50 hover:opacity-100 transition-opacity"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>AI Writing Assistant</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={handleAutoGenerate}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4" />
                Auto Generate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={handleEnhance}
                disabled={isGenerating || !value.trim()}
              >
                <Sparkles className="h-4 w-4" />
                Enhance My Text
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AITextInput;
