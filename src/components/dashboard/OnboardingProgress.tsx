import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

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
            <span className="text-lg">🚀</span>
            <h3 className="font-semibold text-foreground text-sm">
              Onboarding setup!
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
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress Text */}
          <p className="text-xs text-muted-foreground">
            {progress}% completed
          </p>
        </div>
      </div>

      {/* WhatsApp Chat Card */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <p className="text-sm text-foreground mb-3">
          Our Whatsapp chatbot is live!
        </p>
        
        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <MessageCircle size={18} fill="currentColor" />
          <span>Chat with Ethan</span>
        </button>
      </div>
    </div>
  );
};

export default OnboardingProgress;
