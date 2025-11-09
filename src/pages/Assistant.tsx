import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import LunaChat from '@/components/assistant/LunaChat';

const Assistant = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}}
        isAssistantPage={true}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <LunaChat />
        </main>
      </div>
    </div>
  );
};

export default Assistant;
