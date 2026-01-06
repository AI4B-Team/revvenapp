import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import VersusComponent from "@/components/versus/Versus";
import AIVASidePanel from "@/components/dashboard/AIVASidePanel";

const Versus = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed}
        onAIVAPanelToggle={() => setIsAIVAPanelOpen(!isAIVAPanelOpen)}
        isAIVAPanelOpen={isAIVAPanelOpen}
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header />
        <main className="pt-0">
          <VersusComponent />
        </main>
      </div>
      
      <AIVASidePanel 
        isOpen={isAIVAPanelOpen} 
        onClose={() => setIsAIVAPanelOpen(false)}
      />
    </div>
  );
};

export default Versus;
