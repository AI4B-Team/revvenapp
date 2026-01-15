import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import ReferencesModal from '@/components/dashboard/ReferencesModal';
import StylesModal from '@/components/dashboard/StylesModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import AIVAPromptBox, { type SubOptionType } from '@/components/shared/AIVAPromptBox';
import AISuggestionsGrid, { type Suggestion } from '@/components/landing/AISuggestionsGrid';
import PresentationTemplates from '@/components/shared/PresentationTemplates';
import { supabase } from '@/integrations/supabase/client';
import type { Intent } from '@/components/IntentSelector';

const Assistant = () => {
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [stylesModalOpen, setStylesModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userName, setUserName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOptionType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [selectedReferences, setSelectedReferences] = useState<any[]>([]);

  // Get user profile
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          // Get first name only
          setUserName(profile.full_name.split(' ')[0]);
        } else if (user.email) {
          // Fallback to email username
          setUserName(user.email.split('@')[0]);
        }
      }
    };
    getProfile();
  }, []);

  const handleGenerate = () => {
    // Handle generation - this could navigate to results or show loading state
    console.log('Generating...');
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Set the prompt to the suggestion's prompt
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        isAssistantPage={true}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col items-center justify-start min-h-full px-4 sm:px-8 lg:px-16 py-6">
            {/* Prompt Box with Greeting */}
            <div className="w-full">
              <AIVAPromptBox 
                onGenerate={handleGenerate}
                showGreeting={true}
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
              <PresentationTemplates
                onPromptSelect={handlePresentationPromptSelect}
              />
            ) : (
              <div className="w-full mx-auto max-w-[800px]">
                <AISuggestionsGrid
                  intent={selectedIntent}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      
      <ReferencesModal 
        isOpen={referencesModalOpen} 
        onClose={() => setReferencesModalOpen(false)}
        onImagesSelect={handleReferencesSelect}
        initialSelectedImages={selectedReferences}
      />
      
      <StylesModal
        isOpen={stylesModalOpen}
        onClose={() => setStylesModalOpen(false)}
        onSelectStyle={handleStyleSelect}
        selectedStyle={selectedStyle}
      />
      
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen} 
        onClose={() => setIdentitySidebarOpen(false)}
      />
    </div>
  );
};

export default Assistant;
