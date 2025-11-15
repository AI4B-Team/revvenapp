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
  
  // Competitor form (unified for all tabs)
  const [competitorForm, setCompetitorForm] = useState({
    name: '',
    industry: '',
    website: '',
    notes: '',
    // Website specific
    domain: '',
    traffic: '',
    // Email specific
    monitoringEmail: '',
    // Ads specific
    platforms: [] as string[],
    budget: '',
  });

  // Mock search results for social media
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
    setCompetitorForm({ name: '', industry: '', website: '', notes: '', domain: '', traffic: '', monitoringEmail: '', platforms: [], budget: '' });
  };

  const removeEmailCompetitor = (id: string) => {
    const currentEmailCompetitors = formData.emailCompetitors || [];
    onUpdate({ emailCompetitors: currentEmailCompetitors.filter(c => c.id !== id) });
  };

  const generateMonitoringEmail = () => {
    const randomString = Math.random().toString(36).substring(7);
    return `track-${randomString}@intel.yourdomain.com`;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-800';
      case 'tiktok': return 'bg-gray-900 text-white';
      case 'youtube': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Competitive Intelligence</h1>
          </div>
          <p className="text-muted-foreground">Track your competitors' strategies across social, web, email, and advertising.</p>
        </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {['social', 'website', 'email', 'ads'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'social' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Social Competitors</h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </button>
          </div>

          {formData.competitors && formData.competitors.length > 0 ? (
            <div className="space-y-3">
              {formData.competitors.map((creator) => (
                <div key={creator.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">@{creator.username}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlatformColor(creator.platform)}`}>
                          {creator.platform}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{creator.followers} followers • {creator.posts} posts</p>
                    </div>
                    <button onClick={() => removeCompetitor(creator.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No social competitors tracked yet</h3>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Your First Competitor
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'website' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Website Competitors</h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Track competitor websites, domain authority, traffic, and content strategies.</p>
          <div className="text-center py-8 text-muted-foreground">
            Website competitor tracking coming soon
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Email Competitors</h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </button>
          </div>

          {formData.emailCompetitors && formData.emailCompetitors.length > 0 ? (
            <div className="space-y-3">
              {formData.emailCompetitors.map((competitor) => (
                <div key={competitor.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{competitor.name}</h3>
                      <p className="text-sm text-muted-foreground">{competitor.industry}</p>
                    </div>
                    <button onClick={() => removeEmailCompetitor(competitor.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        {competitor.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{competitor.monitoringEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="w-4 h-4" />
                      <span>{competitor.emailsCollected} emails collected</span>
                    </div>
                  </div>
                  {competitor.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                      {competitor.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-border">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No email competitors tracked yet</h3>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Your First Competitor
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ads' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Advertising Competitors</h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Monitor competitor ad campaigns, platforms, messaging, and estimated budgets.</p>
          <div className="text-center py-8 text-muted-foreground">
            Ad competitor tracking coming soon
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Competitor
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSearchResults([]);
                  setSearchQuery('');
                  setCompetitorForm({ name: '', industry: '', website: '', notes: '', domain: '', traffic: '', monitoringEmail: '', platforms: [], budget: '' });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'social' ? (
              <>
                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">Platform</label>
                  <div className="flex gap-2">
                    {(['instagram', 'tiktok', 'youtube'] as const).map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSearchPlatform(platform)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          searchPlatform === platform
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Search by Username or Profile URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSocialSearch()}
                      placeholder="Enter username or paste profile URL..."
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                    <button
                      onClick={handleSocialSearch}
                      disabled={isSearching}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSearching ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Search
                    </button>
                  </div>
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-foreground">Search Results - Click to confirm</label>
                    {searchResults.map((creator) => (
                      <div
                        key={creator.id}
                        onClick={() => toggleCreatorSelection(creator.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          creator.selected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              {creator.profileImage ? (
                                <img src={creator.profileImage} alt={creator.username} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">@{creator.username}</p>
                              <p className="text-sm text-muted-foreground">
                                {creator.followers} followers • {creator.posts} posts
                              </p>
                            </div>
                          </div>
                          {creator.selected && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSelectedCreators}
                    disabled={!searchResults.some(c => c.selected)}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Selected ({searchResults.filter(c => c.selected).length})
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Generic Competitor Form for Website, Email, and Ads */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={competitorForm.name}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })}
                      placeholder="Competitor name"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>

                  {activeTab === 'website' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Domain *</label>
                        <input
                          type="url"
                          value={competitorForm.domain}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, domain: e.target.value })}
                          placeholder="https://competitor.com"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Estimated Monthly Traffic</label>
                        <input
                          type="text"
                          value={competitorForm.traffic}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, traffic: e.target.value })}
                          placeholder="e.g., 100K"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'email' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                        <input
                          type="url"
                          value={competitorForm.website}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, website: e.target.value })}
                          placeholder="https://competitor.com"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Monitoring Email</label>
                        <input
                          type="email"
                          value={competitorForm.monitoringEmail}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, monitoringEmail: e.target.value })}
                          placeholder="Auto-generated if left blank"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          We'll generate a unique email to subscribe to their list
                        </p>
                      </div>
                    </>
                  )}

                  {activeTab === 'ads' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Advertising Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {['Google Ads', 'Meta', 'LinkedIn', 'TikTok', 'YouTube'].map((platform) => (
                            <button
                              key={platform}
                              onClick={() => {
                                const platforms = competitorForm.platforms.includes(platform)
                                  ? competitorForm.platforms.filter(p => p !== platform)
                                  : [...competitorForm.platforms, platform];
                                setCompetitorForm({ ...competitorForm, platforms });
                              }}
                              className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                                competitorForm.platforms.includes(platform)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-border hover:border-primary/50'
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Estimated Monthly Budget</label>
                        <input
                          type="text"
                          value={competitorForm.budget}
                          onChange={(e) => setCompetitorForm({ ...competitorForm, budget: e.target.value })}
                          placeholder="e.g., $10K-50K"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                    <input
                      type="text"
                      value={competitorForm.industry}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, industry: e.target.value })}
                      placeholder="e.g., SaaS, E-commerce"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                    <textarea
                      value={competitorForm.notes}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, notes: e.target.value })}
                      placeholder="Why are you tracking them?"
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setCompetitorForm({ name: '', industry: '', website: '', notes: '', domain: '', traffic: '', monitoringEmail: '', platforms: [], budget: '' });
                    }}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCompetitor}
                    disabled={!competitorForm.name.trim()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Competitor
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-border">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
    </div>
  );
};

export default IntelligencePage;
