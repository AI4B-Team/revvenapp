import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import TemplateSelector from '@/components/monetize/TemplateSelector';
import { useState } from 'react';

const Store = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isMonetizePage={true} onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <TemplateSelector pageType="store" />
        </main>
      </div>
    </div>
  );
};

export default Store;
