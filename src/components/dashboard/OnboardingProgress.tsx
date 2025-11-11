import { useState } from 'react';
import { X, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const OnboardingProgress = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [progress, setProgress] = useState(29);

  if (!showOnboarding) return null;

  return (
    <div className="px-3 py-4 space-y-3">
      
      {/* Onboarding Card */}
      <Link to="/onboarding" className="block">
        <div className="bg-white dark:bg-white rounded-xl p-4 shadow-sm border border-border hover:border-brand-green/50 transition-all cursor-pointer">
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Rocket size={18} className="text-brand-green" />
              <h3 className="font-semibold text-black text-sm">
                Getting Started
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowOnboarding(false);
              }}
              className="text-gray-600 hover:text-black transition-colors"
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
            <p className="text-xs text-gray-600">
              {progress}% Completed
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default OnboardingProgress;
