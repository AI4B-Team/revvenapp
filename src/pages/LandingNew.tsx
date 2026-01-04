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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <RevvenLogo />
          <span className="text-xl font-display font-bold text-foreground">REVVEN</span>
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">
              Start Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            Create Anything — Automate Everything
          </h1>
          <p className="text-lg text-muted-foreground">
            What Would You Like To Do Today?
          </p>
        </div>

        {/* Intent Selector + Prompt Input - using same component */}
        <PromptInput onGenerate={handleGenerate} />
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default LandingNew;
