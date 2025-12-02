import { useState, useEffect } from 'react';
import { X, Rocket, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const OnboardingProgress = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [progress, setProgress] = useState(29);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Calculate time remaining until deadline (24 hours from signup)
  useEffect(() => {
    // Get or set signup date in localStorage for consistency across pages
    let signupDateStr = localStorage.getItem('signupDate');
    if (!signupDateStr) {
      signupDateStr = new Date().toISOString();
      localStorage.setItem('signupDate', signupDateStr);
    }
    const signupDate = new Date(signupDateStr);
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const deadline = new Date(signupDate);
      deadline.setHours(deadline.getHours() + 24); // 24-hour deadline
      
      const diff = deadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('EXPIRED');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!showOnboarding) return null;

  return (
    <div className="px-3 py-4 space-y-3">
      
      {/* Onboarding Card */}
      <Link to="/onboarding" className="block">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border hover:border-brand-green/50 transition-all cursor-pointer">
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-col gap-2">
              <div className="flex items-center gap-2">
                <Rocket size={18} className="text-brand-green" />
                <h3 className="font-semibold text-foreground text-sm">
                  Unlock Rewards
                </h3>
              </div>
              {timeRemaining && timeRemaining !== 'EXPIRED' && (
                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowOnboarding(false);
              }}
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
      </Link>
    </div>
  );
};

export default OnboardingProgress;
