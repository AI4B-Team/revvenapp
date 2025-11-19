import { useState } from 'react';
import { 
  ChevronRight, ChevronDown, SlidersHorizontal, Search, ZoomIn, ZoomOut
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import keishaImage from '@/assets/keisha.png';

const AIAgentsPage = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Content');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const topAgents = [
    {
      id: 1,
      name: 'Brian',
      role: 'The Architect',
      description: 'Builds the automated workflows that scales your business.',
      gradient: 'from-purple-400 to-purple-600',
      icon: 'Users'
    },
    {
      id: 2,
      name: 'Francis',
      role: 'The Strategist',
      description: 'Crafts offers, builds marketing funnels, and campaigns that attract real buyers.',
      gradient: 'from-cyan-400 to-blue-500',
      icon: 'Users'
    },
    {
      id: 3,
      name: 'Rich',
      role: 'The Closer',
      description: 'Writes sales scripts and follow-up sequences that generate revenue.',
      gradient: 'from-orange-400 to-orange-600',
      icon: 'Users'
    },
    {
      id: 4,
      name: 'Dolmar',
      role: 'The Visionary',
      description: 'Generates branded visuals, videos, and AI characters that posts in your voice.',
      gradient: 'from-green-400 to-green-600',
      icon: 'Users'
    },
    {
      id: 5,
      name: 'Keisha',
      role: 'The Creator',
      description: 'Creates digital products, content, and writes sales copy in minutes.',
      image: true,
      icon: 'Users'
    },
    {
      id: 6,
      name: 'Damoi',
      role: 'The Operator',
      description: 'Manages projects and executes systems with precision and consistency.',
      gradient: 'from-teal-400 to-cyan-500',
      icon: 'Users'
    }
  ];

  const topPicks = [
    {
      id: 1,
      name: 'Auto-Responder',
      description: 'Reply to messages instantly',
      icon: '💬',
      color: 'bg-yellow-500'
    },
    {
      id: 2,
      name: 'Content Scheduler',
      description: 'Schedule posts in advance',
      icon: '📅',
      color: 'bg-pink-500'
    },
    {
      id: 3,
      name: 'Analytics Bot',
      description: 'Track metrics automatically',
      icon: '📊',
      color: 'bg-blue-500'
    },
    {
      id: 4,
      name: 'Lead Qualifier',
      description: 'Score and qualify leads',
      icon: '🎯',
      color: 'bg-green-500'
    }
  ];


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isAutomatePage
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="px-8 py-12 border-b border-border">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">
                  <span className="text-primary">AGENTS</span>
                </h1>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-3">
                  {/* All Dropdown */}
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition">
                    <span className="text-sm font-medium">All</span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {/* Filter Button */}
                  <button className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition">
                    <SlidersHorizontal size={18} />
                  </button>
                  
                  {/* Search Button */}
                  <button className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition">
                    <Search size={18} />
                  </button>
                  
                  {/* Zoom Slider */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-lg">
                    <ZoomOut size={16} className="text-muted-foreground" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="50"
                      className="w-32 h-1 bg-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                    <ZoomIn size={16} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg">
                Let AI agents work for you 24/7. Automate your workflows and scale your business effortlessly.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-12">
            <div className="w-full space-y-16">
              
              {/* Top Agents Section */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">TOP AGENTS</h2>
                    <p className="text-muted-foreground">Your AI-powered team ready to transform your business</p>
                  </div>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, trending: !expandedSections.trending })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {topAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer border border-border"
                    >
                      {/* Agent Avatar */}
                      <div className={`relative aspect-square ${agent.image ? '' : `bg-gradient-to-br ${agent.gradient}`}`}>
                        {agent.image ? (
                          <img
                            src={keishaImage}
                            alt={agent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 bg-white">
                        <h3 className="font-bold text-lg mb-1 text-gray-900">{agent.name}</h3>
                        <p className="text-green-600 font-semibold text-sm mb-2">{agent.role}</p>
                        <p className="text-gray-600 text-xs mb-4 line-clamp-3">{agent.description}</p>
                        
                        {/* Activate Button */}
                        <button className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">
                          Activate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Picks Section */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold mb-2">TOP PICKS FOR YOU</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, topPicks: !expandedSections.topPicks })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topPicks.map((automation) => (
                    <div
                      key={automation.id}
                      className="bg-card rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-border"
                    >
                      <div className={`w-12 h-12 ${automation.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                        {automation.icon}
                      </div>
                      <h3 className="font-bold mb-1 text-black">{automation.name}</h3>
                      <p className="text-black text-sm">{automation.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Content Automation */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">CONTENT AUTOMATION</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, contentAuto: !expandedSections.contentAuto })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Blog Publisher', description: 'Auto-publish blog posts', bgColor: 'bg-tool-blue', emoji: '📝' },
                    { name: 'Social Scheduler', description: 'Schedule social posts', bgColor: 'bg-tool-yellow', emoji: '📅' },
                    { name: 'Video Publisher', description: 'Auto-upload videos', bgColor: 'bg-tool-blue', emoji: '🎬' },
                    { name: 'Content Repurposer', description: 'Transform content types', bgColor: 'bg-tool-yellow', emoji: '♻️' },
                    { name: 'Caption Generator', description: 'Generate captions', bgColor: 'bg-tool-blue', emoji: '💬' },
                    { name: 'Hashtag Finder', description: 'Find trending hashtags', bgColor: 'bg-tool-gray', emoji: '#️⃣' },
                    ...(expandedSections.contentAuto ? [
                      { name: 'SEO Writer', description: 'Write SEO content', bgColor: 'bg-tool-blue', emoji: '🔍' },
                      { name: 'Email Drafter', description: 'Draft email campaigns', bgColor: 'bg-tool-yellow', emoji: '📧' },
                      { name: 'Content Calendar', description: 'Plan content schedule', bgColor: 'bg-tool-blue', emoji: '📆' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">MARKETING AUTOMATION</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, marketingAuto: !expandedSections.marketingAuto })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Email Campaigns', description: 'Automate email marketing', bgColor: 'bg-tool-blue', emoji: '📧' },
                    { name: 'Lead Nurturing', description: 'Nurture leads automatically', bgColor: 'bg-tool-pink', emoji: '🌱' },
                    { name: 'A/B Testing Bot', description: 'Auto-test campaigns', bgColor: 'bg-tool-yellow', emoji: '🧪' },
                    { name: 'Ad Optimizer', description: 'Optimize ad spend', bgColor: 'bg-tool-blue', emoji: '💰' },
                    ...(expandedSections.marketingAuto ? [
                      { name: 'Funnel Builder', description: 'Build sales funnels', bgColor: 'bg-tool-blue', emoji: '🎯' },
                      { name: 'Retargeting Bot', description: 'Retarget visitors', bgColor: 'bg-tool-yellow', emoji: '🔄' },
                      { name: 'ROI Tracker', description: 'Track marketing ROI', bgColor: 'bg-tool-pink', emoji: '📊' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">SALES AUTOMATION</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, salesAuto: !expandedSections.salesAuto })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Lead Scorer', description: 'Score leads automatically', bgColor: 'bg-tool-blue', emoji: '⭐' },
                    { name: 'Follow-up Bot', description: 'Auto follow-up leads', bgColor: 'bg-tool-pink', emoji: '🤝' },
                    { name: 'Meeting Scheduler', description: 'Schedule meetings', bgColor: 'bg-tool-blue', emoji: '📆' },
                    { name: 'Proposal Generator', description: 'Create proposals', bgColor: 'bg-tool-yellow', emoji: '📄' },
                    { name: 'Pipeline Manager', description: 'Manage sales pipeline', bgColor: 'bg-tool-blue', emoji: '🔄' },
                    { name: 'Quote Creator', description: 'Generate quotes', bgColor: 'bg-tool-yellow', emoji: '💵' },
                    ...(expandedSections.salesAuto ? [
                      { name: 'Contract Sender', description: 'Send contracts auto', bgColor: 'bg-tool-blue', emoji: '📋' },
                      { name: 'Payment Collector', description: 'Collect payments', bgColor: 'bg-tool-yellow', emoji: '💳' },
                      { name: 'Upsell Bot', description: 'Suggest upsells', bgColor: 'bg-tool-green', emoji: '📈' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">CUSTOMER SERVICE AUTOMATION</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, customerAuto: !expandedSections.customerAuto })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Chatbot', description: 'Auto-reply to customers', bgColor: 'bg-tool-blue', emoji: '💬' },
                    { name: 'Ticket Router', description: 'Route support tickets', bgColor: 'bg-tool-yellow', emoji: '🎫' },
                    { name: 'FAQ Bot', description: 'Answer common questions', bgColor: 'bg-tool-green', emoji: '❓' },
                    { name: 'Feedback Collector', description: 'Collect feedback', bgColor: 'bg-tool-blue', emoji: '⭐' },
                    { name: 'Review Responder', description: 'Respond to reviews', bgColor: 'bg-tool-pink', emoji: '💬' },
                    { name: 'Satisfaction Survey', description: 'Send surveys', bgColor: 'bg-tool-yellow', emoji: '📊' },
                    ...(expandedSections.customerAuto ? [
                      { name: 'Complaint Handler', description: 'Handle complaints', bgColor: 'bg-tool-blue', emoji: '🔧' },
                      { name: 'Onboarding Bot', description: 'Onboard new users', bgColor: 'bg-tool-yellow', emoji: '👋' },
                      { name: 'Retention Bot', description: 'Improve retention', bgColor: 'bg-tool-green', emoji: '🎯' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">WORKFLOW AUTOMATION</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, workflowAuto: !expandedSections.workflowAuto })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Task Manager', description: 'Manage tasks auto', bgColor: 'bg-tool-green', emoji: '✅' },
                    { name: 'Report Generator', description: 'Generate reports', bgColor: 'bg-tool-blue', emoji: '📊' },
                    { name: 'Data Sync', description: 'Sync data across apps', bgColor: 'bg-tool-yellow', emoji: '🔄' },
                    { name: 'Document Filler', description: 'Fill documents auto', bgColor: 'bg-tool-pink', emoji: '📄' },
                    { name: 'Invoice Creator', description: 'Create invoices', bgColor: 'bg-tool-blue', emoji: '🧾' },
                    { name: 'Backup Manager', description: 'Backup files auto', bgColor: 'bg-tool-green', emoji: '💾' },
                    ...(expandedSections.workflowAuto ? [
                      { name: 'Approval Router', description: 'Route approvals', bgColor: 'bg-tool-blue', emoji: '✔️' },
                      { name: 'Calendar Sync', description: 'Sync calendars', bgColor: 'bg-tool-yellow', emoji: '📅' },
                      { name: 'Reminder Bot', description: 'Send reminders', bgColor: 'bg-tool-green', emoji: '⏰' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
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

export default AIAgentsPage;
