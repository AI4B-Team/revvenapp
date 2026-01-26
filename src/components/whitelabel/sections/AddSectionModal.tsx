import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PageBlock } from './PageSection';

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionCreated: (section: PageBlock) => void;
  appName: string;
  appDescription: string;
}

const EXAMPLE_PROMPTS = [
  "A section showing our security features and compliance certifications",
  "Customer success stories with metrics and results",
  "How it works - step by step process explanation",
  "Comparison table showing why we're better than competitors",
  "Team or company values section",
];

export function AddSectionModal({
  open,
  onOpenChange,
  onSectionCreated,
  appName,
  appDescription,
}: AddSectionModalProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe what you want this section to be');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-section', {
        body: { 
          description: description.trim(),
          appName,
          appDescription 
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate section');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const newSection: PageBlock = {
        id: `custom-${Date.now()}`,
        type: data.type,
        enabled: true,
        title: data.title,
        content: data.content,
      };

      onSectionCreated(newSection);
      toast.success('Custom section created!');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Section generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate section');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setDescription(example);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Create Custom Section
          </DialogTitle>
          <DialogDescription>
            Describe what you want this section to showcase and AI will generate the content for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Textarea
              placeholder="Describe your section... e.g., 'A section highlighting our 24/7 customer support, money-back guarantee, and free onboarding assistance'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              <span>Try these examples:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {example.length > 40 ? example.slice(0, 40) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Section
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
