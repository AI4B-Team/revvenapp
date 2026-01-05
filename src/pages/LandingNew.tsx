import { useState } from 'react';
import { Link } from 'react-router-dom';
import RevvenLogo from '@/components/RevvenLogo';
import AIVAPromptBox from '@/components/shared/AIVAPromptBox';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';

const LandingNew = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGenerate = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <RevvenLogo />
          <span className="text-lg font-bold text-slate-900 tracking-tight">REVVEN</span>
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-slate-600 font-medium">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4">
              Start Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-16 max-w-5xl mx-auto w-full">
        {/* Shared AIVA Prompt Box with tagline */}
        <div className="w-full">
          <AIVAPromptBox onGenerate={handleGenerate} showTagline={true} />
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default LandingNew;
