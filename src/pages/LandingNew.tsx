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
const SocialContentCalendar = lazy(() => import('@/components/dashboard/SocialContentCalendar'));

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
  
  // State for external control of mode/subType/model
  const [externalMode, setExternalMode] = useState<string | null>(null);
  const [externalSubType, setExternalSubType] = useState<string | null>(null);
  const [externalModel, setExternalModel] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Check auth state but DON'T auto-redirect - let users view landing page
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
      });

      unsubscribe = () => subscription.unsubscribe();

      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      }).catch(() => setUser(null));
    } catch {
      setUser(null);
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleGenerate = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Set prompt
    setPrompt(suggestion.prompt);
    
    // Set intent to Create (since all creation suggestions are under Create)
    setSelectedIntent('Create');
    
    // Set mode (video, image, audio, etc.)
    if (suggestion.mode) {
      setExternalMode(suggestion.mode);
    }
    
    // Set subType (story, generate, music, etc.)
    if (suggestion.subType) {
      setExternalSubType(suggestion.subType);
    }
    
    // Set model if specified
    if (suggestion.model) {
      setExternalModel(suggestion.model);
    }
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

  // Check if Presentation or Social is selected
  const isPresentationSelected = selectedSubType?.id === 'presentation';
  const isSocialSelected = selectedSubType?.id === 'social';

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
            <Link to="/dashboard">
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
            externalMode={externalMode}
            externalSubType={externalSubType}
            externalModel={externalModel}
          />
        </div>

        {/* Conditionally show Presentation Templates, Calendar, or AI Suggestions */}
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
        ) : isSocialSelected ? (
          <Suspense
            fallback={
              <div className="w-full mx-auto max-w-[850px] mt-6">
                <p className="text-sm text-muted-foreground">Loading calendar…</p>
              </div>
            }
          >
            <div className="w-full mt-4">
              <SocialContentCalendar 
                generatedContent={[]}
                isGenerating={false}
              />
            </div>
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
