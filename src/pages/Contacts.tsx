import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';

const Contacts = () => {
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">Contacts</h1>
            <p className="text-muted-foreground">Manage your contacts here.</p>
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

export default Contacts;
