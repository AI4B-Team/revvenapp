import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RevvenLogo from '@/components/RevvenLogo';
import AIVAPromptBox from '@/components/shared/AIVAPromptBox';
import AISuggestionsGrid, { type Suggestion } from '@/components/landing/AISuggestionsGrid';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Intent } from '@/components/IntentSelector';

const LandingNew = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>('Create');
  const [prompt, setPrompt] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = () => {
    if (user) {
      navigate('/create');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Set the prompt to the suggestion's prompt
    setPrompt(suggestion.prompt);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="w-full px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <RevvenLogo />
          <span className="text-lg font-bold text-slate-900 tracking-tight">REVVEN</span>
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/create">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-6 w-full min-h-0">
        {/* Shared AIVA Prompt Box with tagline */}
        <div className="w-full">
          <AIVAPromptBox 
            onGenerate={handleGenerate} 
            showTagline={true}
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedIntent={selectedIntent}
            onIntentChange={setSelectedIntent}
          />
        </div>

        {/* AI Suggestions Grid */}
        <div className="w-full mx-auto max-w-[800px]">
          <AISuggestionsGrid
            intent={selectedIntent}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default LandingNew;
