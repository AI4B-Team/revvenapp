import React, { useState } from 'react';
import { TrendingUp, Plus, X, Check, Search, Trash2, RefreshCw, Mail, Globe, BarChart3, Users, User } from 'lucide-react';

interface Creator {
  id: string;
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  followers: string;
  posts: number;
  profileImage?: string;
  selected: boolean;
}

interface EmailCompetitor {
  id: string;
  name: string;
  industry: string;
  website: string;
  monitoringEmail: string;
  notes?: string;
  emailsCollected: number;
  lastEmailDate?: string;
  createdAt: Date;
}

interface IntelligencePageProps {
  formData: {
    competitors: Creator[];
    emailCompetitors: EmailCompetitor[];
    trackedContent: any[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const IntelligencePage: React.FC<IntelligencePageProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'social' | 'website' | 'email' | 'ads'>('social');
  const [showModal, setShowModal] = useState(false);
  const [searchPlatform, setSearchPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Creator[]>([]);
  
  const [competitorForm, setCompetitorForm] = useState({
    name: '',
    industry: '',
    website: '',
    notes: '',
    domain: '',
    traffic: '',
    monitoringEmail: '',
    platforms: [] as string[],
    budget: '',
  });

  const mockSearchResults: Creator[] = [
    { id: '1', username: 'hormozi', platform: 'instagram', followers: '4.0M', posts: 3161, selected: false },
    { id: '2', username: 'sebastienjefferies', platform: 'instagram', followers: '713.9K', posts: 966, selected: false },
    { id: '3', username: 'myrasayed_', platform: 'instagram', followers: '23.3K', posts: 41, selected: false },
  ];

  const handleSocialSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 1000);
  };

  const toggleCreatorSelection = (id: string) => {
    setSearchResults(searchResults.map(creator =>
      creator.id === id ? { ...creator, selected: !creator.selected } : creator
    ));
  };

  const handleAddSelectedCreators = () => {
    const selectedCreators = searchResults.filter(c => c.selected);
    const currentCompetitors = formData.competitors || [];
    onUpdate({ competitors: [...currentCompetitors, ...selectedCreators] });
    setShowModal(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeCompetitor = (id: string) => {
    const currentCompetitors = formData.competitors || [];
    onUpdate({ competitors: currentCompetitors.filter(c => c.id !== id) });
  };

  const generateMonitoringEmail = () => {
    const randomString = Math.random().toString(36).substring(7);
    return `monitor-${randomString}@tracking.yourdomain.com`;
  };

  const handleAddCompetitor = () => {
    if (activeTab === 'social') {
      handleAddSelectedCreators();
      return;
    }

    if (!competitorForm.name.trim()) return;

    if (activeTab === 'email') {
      const monitoringEmail = competitorForm.monitoringEmail || generateMonitoringEmail();
      
      const newCompetitor: EmailCompetitor = {
        id: Date.now().toString(),
        name: competitorForm.name,
        industry: competitorForm.industry,
        website: competitorForm.website,
        monitoringEmail: monitoringEmail,
        notes: competitorForm.notes,
        emailsCollected: 0,
        createdAt: new Date(),
      };

      const currentEmailCompetitors = formData.emailCompetitors || [];
      onUpdate({ emailCompetitors: [...currentEmailCompetitors, newCompetitor] });
    }

    setShowModal(false);
    setCompetitorForm({
      name: '',
      industry: '',
      website: '',
      notes: '',
      domain: '',
      traffic: '',
      monitoringEmail: '',
      platforms: [],
      budget: '',
    });
  };

  const tabs = [
    { id: 'social' as const, label: 'Social', icon: Users },
    { id: 'website' as const, label: 'Website', icon: Globe },
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'ads' as const, label: 'Ads', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Competitive Intelligence</h1>
            <p className="text-sm text-gray-600">Track Your Competitors' Strategies Across Social, Web, Email, And Advertising</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tutorial
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 4 of 5</span>
            <span>80% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable with Tabs */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Social Media Competitors</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Competitor
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Track competitor creators and influencers across Instagram, TikTok, and YouTube.</p>
              <div className="text-center py-8 text-gray-500">
                Social media competitor tracking coming soon
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Website Tracking</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Competitor
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Monitor Competitor Websites, Sales Pages, And Landing Pages To Analyze Their Messaging And Conversion Strategies.</p>
              <div className="text-center py-8 text-gray-500">
                Website competitor tracking coming soon
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Email Marketing Intelligence</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Competitor
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Track competitor email campaigns, frequency, and messaging strategies.</p>
              <div className="text-center py-8 text-gray-500">
                Email marketing tracking coming soon
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Advertising Intelligence</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Competitor
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Monitor competitor ad campaigns across platforms.</p>
              <div className="text-center py-8 text-gray-500">
                Advertising intelligence coming soon
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 px-8 py-4 bg-white z-10">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add Competitor</h2>
                  <p className="text-sm text-gray-600 mt-1">Search and select competitors to track</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {activeTab === 'social' ? (
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <select
                      value={searchPlatform}
                      onChange={(e) => setSearchPlatform(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search username or profile..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSocialSearch()}
                    />
                    <button
                      onClick={handleSocialSearch}
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                    >
                      <Search size={18} />
                      Search
                    </button>
                  </div>

                  {isSearching && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-500"></div>
                      <p className="mt-2 text-gray-600">Searching...</p>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((creator) => (
                        <div
                          key={creator.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            creator.selected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
                          }`}
                          onClick={() => toggleCreatorSelection(creator.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">@{creator.username}</h4>
                              <p className="text-sm text-gray-600">{creator.followers} followers · {creator.posts} posts</p>
                            </div>
                            {creator.selected && (
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Check size={16} className="text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <button
                      onClick={handleAddSelectedCreators}
                      className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      Add Selected ({searchResults.filter(c => c.selected).length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Name</label>
                    <input
                      type="text"
                      value={competitorForm.name}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter competitor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="text"
                      value={competitorForm.website}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="https://competitor.com"
                    />
                  </div>

                  {activeTab === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Email (Optional)</label>
                      <input
                        type="text"
                        value={competitorForm.monitoringEmail}
                        onChange={(e) => setCompetitorForm({ ...competitorForm, monitoringEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Will be auto-generated if not provided"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use this email to sign up for their mailing list</p>
                    </div>
                  )}

                  <button
                    onClick={handleAddCompetitor}
                    className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Add Competitor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligencePage;
