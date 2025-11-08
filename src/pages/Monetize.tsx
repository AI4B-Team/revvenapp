import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Monetize = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab="" onTabChange={() => {}} isMonetizePage />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          {/* Main content area - intentionally blank */}
        </main>
      </div>
    </div>
  );
};

export default Monetize;
