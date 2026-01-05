import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import AIVAPromptBox from '@/components/shared/AIVAPromptBox';
import { supabase } from '@/integrations/supabase/client';

const Assistant = () => {
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userName, setUserName] = useState('');

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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        isAssistantPage={true}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-[#f5f7fa]">
          <div className="flex flex-col items-center justify-start min-h-full px-4 sm:px-8 lg:px-16 py-8 lg:py-12">
            {/* Prompt Box with Greeting */}
            <div className="w-full max-w-5xl">
              <AIVAPromptBox 
                onGenerate={handleGenerate}
                showGreeting={false}
              />
            </div>
          </div>
        </main>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen} 
        onClose={() => setIdentitySidebarOpen(false)}
      />
    </div>
  );
};

export default Assistant;
