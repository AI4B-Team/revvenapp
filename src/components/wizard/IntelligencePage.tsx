import React, { useState } from 'react';
import { TrendingUp, Plus, X, Check, Search, Trash2, RefreshCw, Mail, Globe, BarChart3, Users } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'social' | 'email'>('social');
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [searchPlatform, setSearchPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Creator[]>([]);
  
  // Email competitor form
  const [emailCompetitorForm, setEmailCompetitorForm] = useState({
    name: '',
    industry: '',
    website: '',
    notes: '',
    monitoringEmail: '',
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
    setShowSocialModal(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeCompetitor = (id: string) => {
    const currentCompetitors = formData.competitors || [];
    onUpdate({ competitors: currentCompetitors.filter(c => c.id !== id) });
  };

  const handleAddEmailCompetitor = () => {
    if (!emailCompetitorForm.name.trim()) return;

    const monitoringEmail = emailCompetitorForm.monitoringEmail || generateMonitoringEmail();
    
    const newCompetitor: EmailCompetitor = {
      id: Date.now().toString(),
      name: emailCompetitorForm.name,
      industry: emailCompetitorForm.industry,
      website: emailCompetitorForm.website,
      monitoringEmail: monitoringEmail,
      notes: emailCompetitorForm.notes,
      emailsCollected: 0,
      createdAt: new Date(),
    };

    const currentEmailCompetitors = formData.emailCompetitors || [];
    onUpdate({ emailCompetitors: [...currentEmailCompetitors, newCompetitor] });
    
    setShowEmailModal(false);
    setEmailCompetitorForm({ name: '', industry: '', website: '', notes: '', monitoringEmail: '' });
  };

  const removeEmailCompetitor = (id: string) => {
    const currentEmailCompetitors = formData.emailCompetitors || [];
    onUpdate({ emailCompetitors: currentEmailCompetitors.filter(c => c.id !== id) });
  };

  const generateMonitoringEmail = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `comp-${randomId}@yourdomain.resend.app`;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-700';
      case 'tiktok': return 'bg-black text-white';
      case 'youtube': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalCompetitors = (formData.competitors?.length || 0) + (formData.emailCompetitors?.length || 0);
  const totalEmails = formData.emailCompetitors?.reduce((sum, c) => sum + c.emailsCollected, 0) || 0;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intelligence</h1>
            <p className="text-sm text-gray-600">Monitor competitors across social and email</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 4 of 5</span>
            <span>80% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-600 h-2 rounded-full transition-all duration-300" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Competitors</p>
                  <p className="text-3xl font-bold text-blue-900">{totalCompetitors}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Total Emails</p>
                  <p className="text-3xl font-bold text-purple-900">{totalEmails}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-purple-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">New This Week</p>
                  <p className="text-3xl font-bold text-green-900">0</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-green-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('social')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'social'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Social Media
              </div>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'email'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail size={18} />
                Email & Web
              </div>
            </button>
          </div>

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Social Media Creators</h2>
                  <p className="text-sm text-gray-600">Track viral content from top creators</p>
                </div>
                <button
                  onClick={() => setShowSocialModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Add Creator
                </button>
              </div>

              {formData.competitors && formData.competitors.length > 0 ? (
                <div className="space-y-3">
                  {formData.competitors.map((creator) => (
                    <div key={creator.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {creator.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">@{creator.username}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlatformColor(creator.platform)}`}>
                              {creator.platform}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{creator.followers} followers • {creator.posts} posts</p>
                        </div>
                        <button onClick={() => removeCompetitor(creator.id)} className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Users size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No social creators tracked yet</h3>
                  <button onClick={() => setShowSocialModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <Plus size={18} />
                    Add Your First Creator
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Email & Web Tab */}
          {activeTab === 'email' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Email & Website Competitors</h2>
                  <p className="text-sm text-gray-600">Monitor email campaigns and landing pages</p>
                </div>
                <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <Plus size={18} />
                  Add Competitor
                </button>
              </div>

              {formData.emailCompetitors && formData.emailCompetitors.length > 0 ? (
                <div className="space-y-3">
                  {formData.emailCompetitors.map((competitor) => (
                    <div key={competitor.id} className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Mail size={24} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                              <p className="text-sm text-gray-600">{competitor.industry}</p>
                            </div>
                            <button onClick={() => removeEmailCompetitor(competitor.id)} className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          {competitor.website && (
                            <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
                              <Globe size={14} />
                              {competitor.website}
                            </a>
                          )}
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                            📧 {competitor.monitoringEmail}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Mail size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No email competitors yet</h3>
                  <button onClick={() => setShowEmailModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <Plus size={18} />
                    Add Your First Competitor
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button onClick={onBack} className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
          Back
        </button>
        <button onClick={onNext} className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 flex items-center gap-2">
          Continue
          <Check size={18} />
        </button>
      </div>

      {/* Social Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Add Social Media Creator</h2>
              <button onClick={() => { setShowSocialModal(false); setSearchResults([]); setSearchQuery(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Platform</label>
                <div className="flex gap-2">
                  {['instagram', 'tiktok', 'youtube'].map((platform) => (
                    <button key={platform} onClick={() => setSearchPlatform(platform as any)} className={`flex-1 px-4 py-2 rounded-lg font-medium ${searchPlatform === platform ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter username..." className="flex-1 px-4 py-2 border rounded-lg" />
                <button onClick={handleSocialSearch} disabled={isSearching} className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2">
                  {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              {searchResults.length > 0 && searchResults.map((creator) => (
                <div key={creator.id} onClick={() => toggleCreatorSelection(creator.id)} className={`p-4 border-2 rounded-lg cursor-pointer mb-2 ${creator.selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${creator.selected ? 'bg-orange-600 border-orange-600' : 'border-gray-300'}`}>
                      {creator.selected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                      {creator.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">@{creator.username}</h4>
                      <p className="text-sm text-gray-600">{creator.followers} followers</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {searchResults.some(c => c.selected) && (
              <div className="px-6 py-4 border-t flex justify-end">
                <button onClick={handleAddSelectedCreators} className="px-6 py-2 bg-orange-600 text-white rounded-lg">
                  Add {searchResults.filter(c => c.selected).length} Creator{searchResults.filter(c => c.selected).length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Add New Competitor</h2>
              <button onClick={() => { setShowEmailModal(false); setEmailCompetitorForm({ name: '', industry: '', website: '', notes: '', monitoringEmail: '' }); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Competitor Name *</label>
                <input type="text" value={emailCompetitorForm.name} onChange={(e) => setEmailCompetitorForm({ ...emailCompetitorForm, name: e.target.value })} placeholder="e.g., Competitor A" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <input type="text" value={emailCompetitorForm.industry} onChange={(e) => setEmailCompetitorForm({ ...emailCompetitorForm, industry: e.target.value })} placeholder="e.g., Online Business" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input type="url" value={emailCompetitorForm.website} onChange={(e) => setEmailCompetitorForm({ ...emailCompetitorForm, website: e.target.value })} placeholder="https://example.com" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea value={emailCompetitorForm.notes} onChange={(e) => setEmailCompetitorForm({ ...emailCompetitorForm, notes: e.target.value })} placeholder="Any notes..." rows={3} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium mb-2">Your Monitoring Email</label>
                <input type="text" value={emailCompetitorForm.monitoringEmail || generateMonitoringEmail()} onChange={(e) => setEmailCompetitorForm({ ...emailCompetitorForm, monitoringEmail: e.target.value })} className="w-full px-3 py-2 bg-gray-800 text-white font-mono text-sm rounded mb-2" readOnly />
                <div className="space-y-1 text-xs text-gray-700">
                  <p>1. Use this email to sign up for their mailing list</p>
                  <p>2. Their emails will auto-forward here</p>
                  <p>3. We'll analyze everything automatically</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => { setShowEmailModal(false); setEmailCompetitorForm({ name: '', industry: '', website: '', notes: '', monitoringEmail: '' }); }} className="px-6 py-2 hover:bg-gray-200 rounded-lg">
                Cancel
              </button>
              <button onClick={handleAddEmailCompetitor} disabled={!emailCompetitorForm.name.trim()} className="px-6 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50">
                Add Competitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligencePage;
