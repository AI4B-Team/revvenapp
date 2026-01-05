import { useState } from 'react';
import RevvenSidebar from '@/components/dashboard/RevvenSidebar';
import TopBar from '@/components/dashboard/TopBar';
import { TabsProvider } from '@/contexts/TabsContext';

const Chat = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <TabsProvider>
      <div className="flex min-h-screen bg-background">
        <RevvenSidebar 
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onHomeClick={() => setActiveTab('Home')}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 flex flex-col">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <p>Chat content coming soon...</p>
            </div>
          </main>
        </div>
      </div>
    </TabsProvider>
  );
};

export default Chat;
