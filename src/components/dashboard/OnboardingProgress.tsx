import { useState } from 'react';
import { X, Rocket } from 'lucide-react';

const OnboardingProgress = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [progress, setProgress] = useState(29);

  if (!showOnboarding) return null;

  return (
    <div className="px-3 py-4 space-y-3">
      
      {/* Onboarding Card */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        {/* Header with close button */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket size={18} className="text-brand-green" />
            <h3 className="font-semibold text-foreground text-sm">
              Onboarding Setup
            </h3>
          </div>
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress Text */}
          <p className="text-xs text-muted-foreground">
            {progress}% Completed
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
