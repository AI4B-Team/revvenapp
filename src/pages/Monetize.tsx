import { useState } from 'react';
import { Plus, FolderPlus, Clock, List, Search } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';

const Monetize = () => {
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [funnels, setFunnels] = useState([]);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}} 
        isMonetizePage
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="bg-muted/30">
          {/* Header Section */}
          <div className="bg-card border-b border-border">
            <div className="px-8 py-8">
              <div className="flex items-start justify-between mb-6">
                {/* Title and Description */}
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Funnels</h1>
                  <p className="text-base text-muted-foreground">
                    Build funnels to generate leads, appointments and receive payment
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-card hover:bg-accent border-2 border-border text-foreground font-medium rounded-lg flex items-center gap-2 transition-colors">
                    <FolderPlus size={20} />
                    <span>Create Folder</span>
                  </button>
                  <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <Plus size={20} />
                    <span>New Funnel</span>
                  </button>
                </div>
              </div>

              {/* View Controls and Search */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground font-medium">Home</div>
                
                <div className="flex items-center gap-3">
                  {/* View Toggle Buttons */}
                  <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                    <button 
                      onClick={() => setView('time')}
                      className={`p-2 rounded transition-colors ${
                        view === 'time' 
                          ? 'bg-accent text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Time view"
                    >
                      <Clock size={20} />
                    </button>
                    <button 
                      onClick={() => setView('list')}
                      className={`p-2 rounded transition-colors ${
                        view === 'list' 
                          ? 'bg-accent text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="List view"
                    >
                      <List size={20} />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search for Funnels"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-80 border border-border rounded-lg text-sm placeholder-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-8 py-6">
            {/* Table Header (only show if there are funnels) */}
            {funnels.length > 0 ? (
              <div className="bg-card rounded-lg shadow-sm border border-border">
                <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-border">
                  <div className="text-sm font-semibold text-foreground">Name</div>
                  <div className="text-sm font-semibold text-foreground text-right">Last Updated</div>
                </div>

                {/* Funnel Items would go here */}
                <div className="p-6">
                  {funnels.map((funnel, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4 py-4 border-b border-border/50 last:border-0">
                      <div className="text-sm text-foreground">{funnel.name}</div>
                      <div className="text-sm text-muted-foreground text-right">{funnel.lastUpdated}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-card rounded-lg shadow-sm border border-border py-20">
                {/* Table Header (empty) */}
                <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-border mb-16">
                  <div className="text-sm font-semibold text-foreground">Name</div>
                  <div className="text-sm font-semibold text-foreground text-right">Last Updated</div>
                </div>

                {/* Empty State Content */}
                <div className="text-center px-8 py-16">
                  {/* Search Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Search size={32} className="text-primary" />
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Start Creating A Funnel
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    All your funnels and folders will live here. Start by creating your first Funnel
                  </p>

                  {/* CTA Button */}
                  <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm">
                    <Plus size={20} />
                    <span>New Funnel</span>
                  </button>
                </div>
              </div>
            )}
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

export default Monetize;
