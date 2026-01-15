import { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RevvenLogo from '@/components/RevvenLogo';
import AIVAPromptBox, { type SubOptionType } from '@/components/shared/AIVAPromptBox';
import AISuggestionsGrid, { type Suggestion } from '@/components/landing/AISuggestionsGrid';
import AuthModal from '@/components/AuthModal';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import ReferencesModal from '@/components/dashboard/ReferencesModal';
import StylesModal from '@/components/dashboard/StylesModal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Intent } from '@/components/IntentSelector';
import { isStorageAccessible } from '@/utils/isStorageAccessible';

const PresentationTemplates = lazy(() => import('@/components/shared/PresentationTemplates'));

const LandingNew = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [prompt, setPrompt] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOptionType | null>(null);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [stylesModalOpen, setStylesModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [selectedReferences, setSelectedReferences] = useState<any[]>([]);
  const navigate = useNavigate();

  // Instant redirect if user is already logged in (check localStorage first for speed)
  useEffect(() => {
    // Quick check - if there's a session in localStorage, redirect immediately
    const storedSession = localStorage.getItem('sb-ghhafcmjhmwwfhldmxzc-auth-token');
    if (storedSession) {
      navigate('/create', { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!isStorageAccessible()) {
      setUser(null);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN' && session?.user) {
          navigate('/create', { replace: true });
        }
      });

      unsubscribe = () => subscription.unsubscribe();

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          navigate('/create', { replace: true });
        } else {
          setUser(null);
        }
      }).catch(() => setUser(null));
    } catch {
      setUser(null);
    }

    return () => {
      unsubscribe?.();
    };
  }, [navigate]);

  const handleGenerate = () => {
    if (user) {
      navigate('/create');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setPrompt(suggestion.prompt);
  };

  const handlePresentationPromptSelect = (promptText: string) => {
    setPrompt(promptText);
  };

  const handleSubTypeChange = (subType: SubOptionType | null) => {
    setSelectedSubType(subType);
  };

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style);
    setStylesModalOpen(false);
  };

  const handleReferencesSelect = (references: any[]) => {
    setSelectedReferences(references);
    setReferencesModalOpen(false);
  };

  // Check if Presentation is selected
  const isPresentationSelected = selectedSubType?.id === 'presentation';

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
      <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-6 w-full min-h-0 overflow-y-auto">
        {/* Shared AIVA Prompt Box with tagline */}
        <div className="w-full">
          <AIVAPromptBox 
            onGenerate={handleGenerate} 
            showTagline={true}
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedIntent={selectedIntent}
            onIntentChange={setSelectedIntent}
            onSubTypeChange={handleSubTypeChange}
            onStyleClick={() => setStylesModalOpen(true)}
            onReferenceClick={() => setReferencesModalOpen(true)}
            onCharacterClick={() => setCharactersModalOpen(true)}
          />
        </div>

        {/* Conditionally show Presentation Templates or AI Suggestions */}
        {isPresentationSelected ? (
          <Suspense
            fallback={
              <div className="w-full mx-auto max-w-[850px] mt-6">
                <p className="text-sm text-muted-foreground">Loading templates…</p>
              </div>
            }
          >
            <PresentationTemplates onPromptSelect={handlePresentationPromptSelect} />
          </Suspense>
        ) : (
          <div className="w-full mx-auto max-w-[800px]">
            <AISuggestionsGrid
              intent={selectedIntent}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Character Modal */}
      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      
      {/* References Modal */}
      <ReferencesModal 
        isOpen={referencesModalOpen} 
        onClose={() => setReferencesModalOpen(false)}
        onImagesSelect={handleReferencesSelect}
        initialSelectedImages={selectedReferences}
      />
      
      {/* Styles Modal */}
      <StylesModal
        isOpen={stylesModalOpen}
        onClose={() => setStylesModalOpen(false)}
        onSelectStyle={handleStyleSelect}
        selectedStyle={selectedStyle}
      />
    </div>
  );
};

export default LandingNew;
