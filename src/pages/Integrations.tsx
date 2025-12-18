import { useState } from 'react';
import { Search, ExternalLink, Settings } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Integrations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [integrations, setIntegrations] = useState([
    {
      id: 'square',
      name: 'Square',
      url: 'squareup.com',
      description: 'Start selling right out of the box with payments processing, and point-of-sale solutions.',
      icon: '⬛',
      enabled: false,
      color: 'bg-black'
    },
    {
      id: 'webflow',
      name: 'Webflow',
      url: 'webflow.com',
      description: 'Create professional, custom websites in a completely visual canvas with no code.',
      icon: '🔷',
      enabled: false,
      color: 'bg-blue-600'
    },
    {
      id: 'brave',
      name: 'Brave',
      url: 'brave.com',
      description: 'Brave is a free and open-source web browser based on the Chromium web browser.',
      icon: '🦁',
      enabled: false,
      color: 'bg-orange-600'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      url: 'chat.openai.com',
      description: 'A natural language processing tool driven by AI technology for human-like conversations.',
      icon: '🤖',
      enabled: false,
      color: 'bg-black'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      url: 'mailchimp.com',
      description: 'Grow your business an all-in-One marketing, automation & email marketing platform.',
      icon: '🐵',
      enabled: false,
      color: 'bg-yellow-400'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      url: 'stripe.com',
      description: 'A suite of APIs powering online payment processing and commerce solutions.',
      icon: 'S',
      enabled: false,
      color: 'bg-indigo-600'
    },
    {
      id: 'framer',
      name: 'Framer',
      url: 'framer.com',
      description: 'Design your website on a familiar canvas. Add animations, interactions and a CMS.',
      icon: 'F',
      enabled: false,
      color: 'bg-black'
    },
    {
      id: 'asana',
      name: 'Asana',
      url: 'asana.com',
      description: 'Track, manage, and connect your projects across any team, right from your dashboard.',
      icon: '🔴',
      enabled: false,
      color: 'bg-red-500'
    },
    {
      id: 'linear',
      name: 'Linear',
      url: 'linear.app',
      description: 'Streamline software projects, sprints, tasks, and bug tracking.',
      icon: '◆',
      enabled: false,
      color: 'bg-indigo-700'
    },
    {
      id: 'slack',
      name: 'Slack',
      url: 'slack.com',
      description: 'Connect your team with the messaging app for the workplace.',
      icon: '#',
      enabled: false,
      color: 'bg-purple-600'
    },
    {
      id: 'notion',
      name: 'Notion',
      url: 'notion.so',
      description: 'One workspace for your notes, tasks, wikis, and databases.',
      icon: 'N',
      enabled: false,
      color: 'bg-black'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      url: 'zapier.com',
      description: 'Automate workflows by connecting your apps and services together.',
      icon: '⚡',
      enabled: false,
      color: 'bg-orange-500'
    }
  ]);
  const [showAll, setShowAll] = useState(false);

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ));
  };

  const filteredIntegrations = integrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedIntegrations = showAll ? filteredIntegrations : filteredIntegrations.slice(0, 9);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      INTEGRATIONS
                    </h1>
                    <p className="text-gray-600">
                      Supercharge your workflow and connect the tools you and your team uses every day.
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative w-80">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Upgrade Banner */}
                {showUpgradeBanner && (
                  <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        Upgrade To A Paid Plan For UNLIMITED Custom Integrations
                      </h3>
                      <p className="text-green-100 text-sm">
                        Paid plans offer more integrations, higher usage limits, additional branches, and much more.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                      <button
                        onClick={() => setShowUpgradeBanner(false)}
                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                      >
                        Dismiss
                      </button>
                      <button className="px-6 py-2 bg-white text-green-700 hover:bg-green-50 rounded-lg transition-colors font-bold">
                        Upgrade now
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                          {integration.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {integration.name}
                          </h3>
                        </div>
                      </div>
                      <a
                        href={`https://${integration.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    {/* URL */}
                    <a
                      href={`https://${integration.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-primary mb-3 inline-flex items-center gap-1 transition-colors"
                    >
                      {integration.url}
                      <ExternalLink size={12} />
                    </a>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {integration.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                        <Settings size={16} />
                        <span>Manage</span>
                      </button>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleIntegration(integration.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          integration.enabled ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            integration.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {!showAll && filteredIntegrations.length > 9 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Show More
                  </button>
                </div>
              )}

              {/* No Results */}
              {filteredIntegrations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No integrations found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Integrations;
