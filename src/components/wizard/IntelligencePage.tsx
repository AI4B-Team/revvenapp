import React, { useState } from 'react';
import { TrendingUp, Plus, X, Check, Search, Play, Eye, Heart, MessageCircle, Trash2, RefreshCw } from 'lucide-react';

interface Creator {
  id: string;
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  followers: string;
  posts: number;
  profileImage?: string;
  selected: boolean;
}

interface ContentItem {
  id: string;
  creatorUsername: string;
  thumbnail: string;
  views: string;
  likes: string;
  comments: string;
  caption: string;
  date: string;
}

interface IntelligencePageProps {
  formData: {
    competitors: Creator[];
    trackedContent: ContentItem[];
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchPlatform, setSearchPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Creator[]>([]);

  // Mock search results
  const mockSearchResults: Creator[] = [
    {
      id: '1',
      username: 'hormozi',
      platform: 'instagram',
      followers: '4.0M',
      posts: 3161,
      selected: false,
    },
    {
      id: '2',
      username: 'sebastienjefferies',
      platform: 'instagram',
      followers: '713.9K',
      posts: 966,
      selected: false,
    },
    {
      id: '3',
      username: 'myrasayed_',
      platform: 'instagram',
      followers: '23.3K',
      posts: 41,
      selected: false,
    },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
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
    setShowAddModal(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeCompetitor = (id: string) => {
    const currentCompetitors = formData.competitors || [];
    onUpdate({ competitors: currentCompetitors.filter(c => c.id !== id) });
  };

  const getReels = () => {
    // Simulate fetching content
    console.log('Fetching reels from tracked creators...');
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-700';
      case 'tiktok':
        return 'bg-black text-white';
      case 'youtube':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
            <p className="text-sm text-gray-600">Track competitors and analyze viral content</p>
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
          
          {/* Tracked Creators Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Tracked Creators 
                  {formData.competitors && formData.competitors.length > 0 && (
                    <span className="text-sm font-normal text-gray-600">
                      ({formData.competitors.length}/50)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-600">Monitor your top competitors and industry leaders</p>
              </div>
              <div className="flex gap-2">
                {formData.competitors && formData.competitors.length > 0 && (
                  <button
                    onClick={getReels}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <RefreshCw size={16} />
                    Get Reels
                  </button>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Add Creator
                </button>
              </div>
            </div>

            {formData.competitors && formData.competitors.length > 0 ? (
              <div className="space-y-3">
                {formData.competitors.map((creator) => (
                  <div key={creator.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Profile Image */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {creator.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Creator Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">@{creator.username}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlatformColor(creator.platform)}`}>
                            {creator.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {creator.followers} followers • {creator.posts} posts
                        </p>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => removeCompetitor(creator.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Search size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No creators tracked yet</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Start tracking your competitors and industry leaders to analyze their top-performing content
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Add Your First Creator
                </button>
              </div>
            )}
          </div>

          {/* Intelligence Info */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-600" />
              How Intelligence Works
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">1.</span>
                Track your top competitors and industry leaders by adding their social profiles
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">2.</span>
                Our AI agents continuously monitor and analyze their most viral content
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">3.</span>
                We transcribe videos and extract winning patterns, hooks, and strategies
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">4.</span>
                Your AI copywriting agent transforms these insights into original scripts in your brand voice
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">5.</span>
                Generate data-driven content that's proven to perform, customized for your brand
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          Continue
          <Check size={18} />
        </button>
      </div>

      {/* Add Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Creator to Track</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              
              {/* Platform Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platform
                </label>
                <div className="flex gap-2">
                  {['instagram', 'tiktok', 'youtube'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setSearchPlatform(platform as any)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        searchPlatform === platform
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter {searchPlatform} username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter username..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Search Results ({searchResults.filter(c => c.selected).length} of {searchResults.length} selected)
                    </h3>
                    <button
                      onClick={() => setSearchResults(searchResults.map(c => ({ ...c, selected: false })))}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((creator) => (
                      <div
                        key={creator.id}
                        onClick={() => toggleCreatorSelection(creator.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          creator.selected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            creator.selected
                              ? 'bg-orange-600 border-orange-600'
                              : 'border-gray-300'
                          }`}>
                            {creator.selected && <Check size={14} className="text-white" />}
                          </div>

                          {/* Profile */}
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                            {creator.username.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">@{creator.username}</h4>
                            <p className="text-sm text-gray-600">
                              {creator.followers} followers • {creator.posts} posts
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {searchResults.some(c => c.selected) && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={handleAddSelectedCreators}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add {searchResults.filter(c => c.selected).length} Creator{searchResults.filter(c => c.selected).length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligencePage;
