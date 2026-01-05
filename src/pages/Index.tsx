import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { 
  Search, Plus, Settings, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  gradient: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');

  // Sample gradients for project cards
  const gradients = [
    'bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400',
    'bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500',
    'bg-gradient-to-br from-cyan-400 via-emerald-400 to-purple-500',
    'bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-600',
    'bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500',
    'bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600',
  ];

  // Sample projects - in real app, these would come from database
  const [projects] = useState<Project[]>([
    { id: '1', name: 'Revven 2.0', updatedAt: '8 hours ago', gradient: gradients[0] },
    { id: '2', name: 'Revven 2.0', updatedAt: '9 hours ago', gradient: gradients[1] },
    { id: '3', name: 'Untitled', updatedAt: '2 days ago', gradient: gradients[2] },
    { id: '4', name: 'Untitled', updatedAt: '5 days ago', gradient: gradients[3] },
  ]);

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get user profile
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }
      }
    };
    getProfile();
  }, []);

  const formatTimeAgo = (time: string) => {
    return `Updated ${time}`;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {identitySidebarOpen && (
        <AIPersonaSidebar 
          isOpen={identitySidebarOpen}
          onClose={() => setIdentitySidebarOpen(false)}
        />
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-[#f0f9f8]">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            
            {/* Trial Banner */}
            <div className="bg-white rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Start Your 14-Day Free Trial Of Our PRO Plan!</h3>
                  <p className="text-muted-foreground text-sm">Unlock unlimited projects, custom domains, and more.</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
                Start Trial
              </button>
            </div>

            {/* Workspace Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Workspace</h1>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors">
                  <Zap size={14} />
                  Upgrade
                </button>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Settings size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Search and Create */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <button 
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                <Plus size={18} />
                Create project
              </button>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => navigate('/create')}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group"
                  >
                    {/* Gradient Preview */}
                    <div className={`aspect-[4/3] ${project.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Project Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(project.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No Projects Found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
    </div>
  );
};

export default Index;
