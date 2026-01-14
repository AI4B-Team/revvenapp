import React, { useState, useEffect } from 'react';
import { Loader2, X, CheckCircle, BookOpen, FileText, Image, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  icon: typeof Sparkles;
}

const GENERATION_STEPS: GenerationStep[] = [
  { 
    id: 'analyzing', 
    label: 'Analyzing Source Material', 
    description: 'Processing your input and extracting key themes...',
    icon: FileText 
  },
  { 
    id: 'details', 
    label: 'Building Ebook Details', 
    description: 'Creating ebook structure and key topics...',
    icon: Sparkles 
  },
  { 
    id: 'outline', 
    label: 'Generating Chapter Outline', 
    description: 'Organizing chapters and content flow...',
    icon: BookOpen 
  },
  { 
    id: 'content', 
    label: 'Writing Chapter Content', 
    description: 'Crafting engaging content for each chapter...',
    icon: FileText 
  },
  { 
    id: 'images', 
    label: 'Generating Images', 
    description: 'Creating AI illustrations for your chapters...',
    icon: Image 
  },
];

interface GenerationProgressPanelProps {
  isGenerating: boolean;
  totalChapters?: number;
  currentChapter?: number;
  currentChapterTitle?: string;
  onCancel?: () => void;
  onComplete?: () => void;
}

const GenerationProgressPanel: React.FC<GenerationProgressPanelProps> = ({
  isGenerating,
  totalChapters = 5,
  currentChapter = 1,
  currentChapterTitle = 'Introduction',
  onCancel,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      setProgress(0);
      return;
    }

    const stepDuration = 4000; // 4 seconds per step
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const targetProgress = ((currentStepIndex + 1) / GENERATION_STEPS.length) * 100;
        if (prev >= targetProgress - 1) {
          return prev;
        }
        return prev + 0.5;
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= GENERATION_STEPS.length - 1) {
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isGenerating, currentStepIndex, onComplete]);

  if (!isGenerating) return null;

  const currentStep = GENERATION_STEPS[currentStepIndex];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Generating Chapters
            </h3>
            <p className="text-sm text-gray-500">
              Chapter {currentChapter}/{totalChapters}: {currentChapterTitle}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{currentStep?.label}</span>
          <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {GENERATION_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent ? 'bg-blue-50 border border-blue-200' :
                isComplete ? 'bg-gray-50' : 'opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isComplete ? 'bg-emerald-100 text-emerald-600' :
                isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-900' : isComplete ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-blue-600 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-gray-600"
        >
          Cancel Generation
        </Button>
      </div>
    </div>
  );
};

export default GenerationProgressPanel;
