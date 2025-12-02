import { useState, useEffect } from 'react';
import { Rocket, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const OnboardingProgress = () => {
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

  return (
    <div className="px-3 py-4 space-y-3">
      
      {/* Onboarding Card */}
      <Link to="/onboarding" className="block">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border hover:border-brand-green/50 transition-all cursor-pointer">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={18} className="text-brand-green" />
            <h3 className="font-semibold text-foreground text-sm">
              Unlock Rewards
            </h3>
          </div>

          {/* Countdown Timer */}
          {timeRemaining && timeRemaining !== 'EXPIRED' && (
            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse mb-3 w-fit">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining}</span>
            </div>
          )}

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
