import React from 'react';
import { Check, FileText, Settings, List, BookOpen } from 'lucide-react';

export type EbookBuilderStep = 'source' | 'details' | 'outline' | 'chapters';

// Keep old export for backwards compatibility
export type CourseBuilderStep = EbookBuilderStep;

interface EbookBuilderProgressProps {
  currentStep: EbookBuilderStep;
  onStepClick?: (step: EbookBuilderStep) => void;
  completedSteps?: EbookBuilderStep[];
}

const STEPS: { id: EbookBuilderStep; label: string; icon: typeof FileText }[] = [
  { id: 'source', label: 'Source Material', icon: FileText },
  { id: 'details', label: 'Ebook Details', icon: Settings },
  { id: 'outline', label: 'Chapter Outline', icon: List },
  { id: 'chapters', label: 'Chapter Drafts', icon: BookOpen },
];

const EbookBuilderProgress: React.FC<EbookBuilderProgressProps> = ({
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          const isClickable = isCompleted || isPast || isCurrent;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : isCurrent 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className={`text-sm font-medium text-center max-w-[100px] ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div className={`h-full rounded-full transition-all ${
                    index < currentIndex || completedSteps.includes(STEPS[index + 1].id)
                      ? 'bg-emerald-500' 
                      : 'bg-gray-200'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default EbookBuilderProgress;
