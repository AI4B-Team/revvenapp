import React from 'react';
import { Check, Palette, MessageSquare, Database, Brain, Users, ClipboardCheck } from 'lucide-react';

export type BrandWizardStep = 'identity' | 'voice' | 'knowledge' | 'intelligence' | 'characters' | 'review';

interface BrandWizardProgressProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const STEPS: { id: BrandWizardStep; label: string; icon: typeof Palette }[] = [
  { id: 'identity', label: 'Identity', icon: Palette },
  { id: 'voice', label: 'Voice', icon: MessageSquare },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  { id: 'intelligence', label: 'Intelligence', icon: Brain },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
];

const BrandWizardProgress: React.FC<BrandWizardProgressProps> = ({
  currentStep,
  onStepClick,
}) => {
  // Don't show progress bar on the completion step (step 6)
  if (currentStep >= 6) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick?.(index)}
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
                    index < currentStep
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

export default BrandWizardProgress;
