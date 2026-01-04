import { useState } from 'react';
import { Link } from 'react-router-dom';
import RevvenLogo from '@/components/RevvenLogo';
import PromptInput from '@/components/PromptInput';
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

      {/* Main Content - positioned higher so dropdowns don't go below fold */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-16 max-w-5xl mx-auto w-full">
        {/* Greeting */}
        <div className="text-center mb-5">
          <p className="text-lg text-slate-400 mb-2 tracking-wide">
            Create Anything — Automate Everything
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight max-w-[52rem] mx-auto">
            What Would You Like To Do Today?
          </h1>
        </div>

        {/* Intent Selector + Prompt Input */}
        <div className="w-full">
          <PromptInput onGenerate={handleGenerate} />
        </div>
      </main>


      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default LandingNew;
