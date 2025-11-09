import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Revenue = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab="" onTabChange={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">Revenue</h1>
            <p className="text-muted-foreground">Track your revenue here.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Revenue;
