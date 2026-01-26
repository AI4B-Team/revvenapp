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
import { toast } from 'sonner';

interface AITextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  context?: string; // Context for AI generation (e.g., "app name", "product description")
  multiline?: boolean;
  className?: string;
  rows?: number;
}

const AITextInput: React.FC<AITextInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  context = '',
  multiline = false,
  className = '',
  rows = 3,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation - in production, call Lovable AI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedTexts: Record<string, string[]> = {
        tagline: [
          'Transform Your Business With AI-Powered Solutions',
          'Unlock Your Potential With Smart Automation',
          'The Future of Work, Available Today',
        ],
        description: [
          'Streamline your workflow, boost productivity, and achieve more with our cutting-edge platform designed for modern businesses.',
          'Experience the power of intelligent automation that adapts to your needs and scales with your growth.',
          'Join thousands of successful businesses already transforming their operations with our innovative solutions.',
        ],
        feature_title: [
          'Smart Automation',
          'Real-Time Analytics',
          'Seamless Integration',
          'AI-Powered Insights',
        ],
        feature_description: [
          'Automate repetitive tasks and focus on what matters most to your business.',
          'Get instant insights with powerful analytics that drive better decisions.',
          'Connect with your favorite tools and workflows effortlessly.',
        ],
        capability_title: [
          'Lightning Fast',
          'Always Secure',
          'Infinitely Scalable',
        ],
        capability_description: [
          'Experience blazing-fast performance that keeps you ahead of the competition.',
          'Enterprise-grade security that protects your data around the clock.',
          'Grow without limits - our infrastructure scales with your success.',
        ],
        testimonial_quote: [
          'This platform has completely transformed how we operate. The results speak for themselves.',
          'The best investment we\'ve made this year. ROI was visible within the first month.',
          'Incredible product with even better support. Highly recommended!',
        ],
        headline: [
          'Ready to Transform Your Business?',
          'Start Your Success Story Today',
          'Join the Revolution',
        ],
        subheadline: [
          'Join thousands of successful businesses already using our platform.',
          'Get started in minutes and see results immediately.',
          'No credit card required. Start your free trial now.',
        ],
        button_text: [
          'Get Started Free',
          'Start Your Trial',
          'Try It Now',
        ],
        faq_question: [
          'How do I get started?',
          'Is there a free trial?',
          'What kind of support do you offer?',
        ],
        faq_answer: [
          'Getting started is easy! Simply sign up for a free account and follow our quick onboarding guide.',
          'Yes! We offer a 14-day free trial with full access to all features. No credit card required.',
          'We offer 24/7 customer support via chat, email, and phone for all paid plans.',
        ],
        default: [
          'Professional content that engages your audience.',
          'Clear, compelling messaging that converts.',
          'Expertly crafted copy that drives results.',
        ],
      };

      const contextKey = context.toLowerCase().replace(/\s+/g, '_');
      const options = generatedTexts[contextKey] || generatedTexts.default;
      const generated = options[Math.floor(Math.random() * options.length)];
      
      onChange(generated);
      toast.success('Content generated!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Generation failed. Please try again.');
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
      // Simulate AI enhancement - in production, call Lovable AI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple enhancement simulation
      const enhancements = [
        // Make more compelling
        (text: string) => {
          const words = text.split(' ');
          if (words.length < 5) {
            return `${text} – designed for success.`;
          }
          return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
        },
        // Add power words
        (text: string) => {
          const powerWords = ['innovative', 'powerful', 'seamless', 'intelligent'];
          const randomWord = powerWords[Math.floor(Math.random() * powerWords.length)];
          if (!text.toLowerCase().includes(randomWord)) {
            return text.replace(/^(\w+)/, `${randomWord.charAt(0).toUpperCase()}${randomWord.slice(1)}`);
          }
          return text;
        },
        // Improve clarity
        (text: string) => {
          return text
            .replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .replace(/\.\s*$/, '') + '.';
        },
      ];
      
      const enhance = enhancements[Math.floor(Math.random() * enhancements.length)];
      const enhanced = enhance(value);
      
      onChange(enhanced);
      toast.success('Content enhanced!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Enhancement failed. Please try again.');
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
