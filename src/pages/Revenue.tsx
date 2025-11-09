import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import IncomeDashboard from '@/components/revenue/IncomeDashboard';

const Revenue = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab="" onTabChange={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-background p-8">
          <IncomeDashboard />
        </main>
      </div>
    </div>
  );
};

export default Revenue;
