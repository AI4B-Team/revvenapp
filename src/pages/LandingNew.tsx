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
import { socialPlatforms } from '@/components/dashboard/SocialIcons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check } from 'lucide-react';

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
  
  // State for social platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
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
    // Serialize subType without the icon (React component can't be cloned)
    const serializableSubType = selectedSubType ? {
      id: selectedSubType.id,
      label: selectedSubType.label,
      color: selectedSubType.color,
    } : null;
    
    // Serialize style without any non-cloneable properties
    const serializableStyle = selectedStyle ? {
      id: selectedStyle.id,
      name: selectedStyle.name,
      preview: selectedStyle.preview,
    } : null;
    
    console.log('handleGenerate called with state:', {
      prompt,
      selectedIntent,
      selectedSubType: serializableSubType,
      selectedStyle: serializableStyle,
      selectedReferences,
      externalMode,
      externalModel,
      selectedPlatforms,
    });
    
    if (user) {
      // Navigate to create page with all prompt box state
      navigate('/create', {
        state: {
          fromLanding: true,
          prompt,
          intent: selectedIntent,
          subType: serializableSubType,
          style: serializableStyle,
          references: selectedReferences,
          mode: externalMode,
          model: externalModel,
          platforms: selectedPlatforms,
        }
      });
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

  // Handle mode changes and set intent accordingly
  const handleModeChange = (mode: string | null) => {
    setExternalMode(mode);
    // Set intent to Create for create-type modes
    if (mode && ['video', 'image', 'audio', 'design', 'content', 'document'].includes(mode)) {
      setSelectedIntent('Create');
    }
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
            onModeChange={handleModeChange}
            onModelChange={setExternalModel}
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
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            }
          >
            <div className="w-full mt-4 space-y-6">
              {/* Platform Selection */}
              <div className="flex justify-center">
                <div className="p-6 bg-card rounded-xl border-2 border-border shadow-sm">
                  <p className="text-foreground font-semibold mb-6 text-center text-xl">
                    Choose Your Platforms To Generate Content For Each One
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 flex-nowrap overflow-visible pb-2 px-2 pt-3">
                    <button
                      onClick={() => {
                        if (selectedPlatforms.length === socialPlatforms.length) {
                          setSelectedPlatforms([]);
                        } else {
                          setSelectedPlatforms(socialPlatforms.map(p => p.id));
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all !whitespace-nowrap inline-flex items-center flex-shrink-0 ${
                        selectedPlatforms.length === socialPlatforms.length
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {selectedPlatforms.length === socialPlatforms.length ? 'Deselect All' : 'Select All'}
                    </button>

                    {socialPlatforms.map(platform => {
                      const isSelected = selectedPlatforms.includes(platform.id);
                      const IconComponent = platform.Icon;

                      return (
                        <Tooltip key={platform.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedPlatforms(prev =>
                                  prev.includes(platform.id)
                                    ? prev.filter(id => id !== platform.id)
                                    : [...prev, platform.id]
                                );
                              }}
                              className={`relative p-3 rounded-2xl transition-all border-2 flex-shrink-0 ${
                                isSelected
                                  ? 'bg-card shadow-lg border-emerald-500'
                                  : 'bg-muted/50 hover:bg-muted border-transparent hover:border-emerald-500'
                              }`}
                            >
                              <IconComponent className="w-9 h-9" />
                              {isSelected && (
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{platform.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                  
                  {selectedPlatforms.length > 0 && (
                    <p className="text-base text-muted-foreground mt-4 text-center">
                      {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected • {selectedPlatforms.length * 30} posts will be generated
                    </p>
                  )}
                </div>
              </div>

              {/* Content Calendar */}
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
