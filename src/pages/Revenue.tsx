import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import IncomeDashboard from '@/components/revenue/IncomeDashboard';
import { useState } from 'react';

const Revenue = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeTab="" onTabChange={() => {}} onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-background p-8">
          <IncomeDashboard />
        </main>
      </div>
    </div>
  );
};

export default Revenue;
