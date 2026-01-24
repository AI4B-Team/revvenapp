import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  Search, TrendingUp, Video, BarChart3, Zap, Download, 
  Plus, Filter, Star, Eye, ThumbsUp, MessageSquare, Share2,
  Sparkles, Target, Layout, Clock, Users, ArrowRight,
  BookmarkPlus, Edit3, PlayCircle, Grid, List, SlidersHorizontal,
  RefreshCw, ExternalLink, Copy, Check, ChevronDown, X,
  TrendingDown, PieChart, Activity, Calendar, Award,
  Mic, FileText, Wand2, CheckCircle, AlertCircle, Save
} from 'lucide-react';

const DigitalSpy = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedNiche, setSelectedNiche] = useState('real-estate');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Script generator state
  const [scriptStep, setScriptStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [scriptConfig, setScriptConfig] = useState({
    topic: '',
    hook: '',
    style: 'educational',
    length: 'medium',
    tone: 'professional',
    cta: 'subscribe',
    includeStats: true,
    includeStory: true,
    platform: 'youtube'
  });

  // Sample data
  const niches = [
    { id: 'real-estate', name: 'Real Estate', count: 2847 },
    { id: 'tech', name: 'Technology', count: 4521 },
    { id: 'finance', name: 'Finance', count: 3102 },
    { id: 'wellness', name: 'Wellness', count: 2934 }
  ];

  const trendingContent = [
    {
      id: 1,
      title: "How I Made $50K in 30 Days Wholesaling",
      channel: "@realestatepro",
      thumbnail: "🏠",
      views: "1.2M",
      engagement: "8.5%",
      outlierScore: 94,
      duration: "15:23",
      posted: "2d ago",
      hooks: [
        "The one deal that changed everything...",
        "What nobody tells you about wholesaling",
        "I was broke 30 days ago, now..."
      ],
      style: "Educational + Personal Story",
      platform: "TikTok"
    },
    {
      id: 2,
      title: "5 Properties Buyers Are Fighting Over",
      channel: "@marketinsider",
      thumbnail: "📊",
      views: "892K",
      engagement: "12.3%",
      outlierScore: 89,
      duration: "8:45",
      posted: "4d ago",
      hooks: [
        "These properties are in high demand...",
        "Buyers are literally fighting over...",
        "The market is crazy right now"
      ],
      style: "List Format + Urgency",
      platform: "YouTube"
    },
    {
      id: 3,
      title: "Creative Finance Deal Breakdown",
      channel: "@dealguru",
      thumbnail: "💰",
      views: "654K",
      engagement: "15.7%",
      outlierScore: 91,
      duration: "12:18",
      posted: "1w ago",
      hooks: [
        "Here's how I bought with $0 down...",
        "Banks don't want you to know this",
        "This strategy is game-changing"
      ],
      style: "Case Study + Tutorial",
      platform: "Instagram"
    }
  ];

  const metrics = [
    { label: 'Avg Views', value: '847K', change: '+23.5%', trend: 'up', icon: Eye, color: 'blue' },
    { label: 'Engagement Rate', value: '12.3%', change: '+5.2%', trend: 'up', icon: ThumbsUp, color: 'emerald' },
    { label: 'Outlier Score', value: '89', change: '+12', trend: 'up', icon: Zap, color: 'amber' },
    { label: 'Content Analyzed', value: '2,847', change: '+342', trend: 'up', icon: BarChart3, color: 'purple' }
  ];

  const topPerformers = [
    { rank: 1, title: "Creative Finance Breakdown", score: 94, views: "1.2M", engagement: "15.7%" },
    { rank: 2, title: "Market Crash Coming?", score: 91, views: "892K", engagement: "14.2%" },
    { rank: 3, title: "Wholesaling Secrets", score: 89, views: "654K", engagement: "13.8%" }
  ];

  const contentTypes = [
    { type: 'Educational', count: 847, percentage: 35 },
    { type: 'Case Studies', count: 623, percentage: 26 },
    { type: 'Market Analysis', count: 489, percentage: 20 },
    { type: 'Personal Story', count: 345, percentage: 14 },
    { type: 'Other', count: 120, percentage: 5 }
  ];

  const trendingTopics = [
    { topic: 'Creative Finance', mentions: 342, trend: 'up', change: 45 },
    { topic: 'Market Crash', mentions: 287, trend: 'up', change: 38 },
    { topic: 'Wholesaling', mentions: 234, trend: 'down', change: -12 },
    { topic: 'Subject-To', mentions: 198, trend: 'up', change: 67 },
    { topic: 'Fix & Flip', mentions: 156, trend: 'neutral', change: 2 }
  ];

  const styles = [
    { id: 'educational', name: 'Educational', description: 'Teach and explain concepts clearly', icon: '📚', avgScore: 87 },
    { id: 'story', name: 'Story-Driven', description: 'Narrative with personal experiences', icon: '📖', avgScore: 92 },
    { id: 'case-study', name: 'Case Study', description: 'Real-world examples and breakdowns', icon: '📊', avgScore: 89 },
    { id: 'tutorial', name: 'Tutorial', description: 'Step-by-step how-to format', icon: '🎯', avgScore: 85 },
    { id: 'list', name: 'List/Countdown', description: 'Top X, X Ways, X Reasons format', icon: '📝', avgScore: 83 },
    { id: 'controversial', name: 'Controversial', description: 'Challenge common beliefs', icon: '⚡', avgScore: 94 }
  ];

  const tones = [
    { id: 'professional', name: 'Professional', emoji: '👔' },
    { id: 'casual', name: 'Casual & Friendly', emoji: '😊' },
    { id: 'urgent', name: 'Urgent & Direct', emoji: '🚨' },
    { id: 'motivational', name: 'Motivational', emoji: '🔥' },
    { id: 'authoritative', name: 'Authoritative', emoji: '👨‍💼' },
    { id: 'conversational', name: 'Conversational', emoji: '💬' }
  ];

  const lengths = [
    { id: 'short', name: 'Short', duration: '30-60s', words: '75-150' },
    { id: 'medium', name: 'Medium', duration: '1-3min', words: '150-450' },
    { id: 'long', name: 'Long', duration: '3-5min', words: '450-750' },
    { id: 'extended', name: 'Extended', duration: '5-10min', words: '750-1500' }
  ];

  const hooks = [
    { text: "What nobody tells you about...", score: 92, engagement: "14.2%" },
    { text: "I was broke 30 days ago, now...", score: 94, engagement: "16.8%" },
    { text: "The one thing that changed everything...", score: 89, engagement: "12.5%" },
    { text: "Here's the truth they don't want you to know...", score: 91, engagement: "15.3%" },
    { text: "This mistake cost me $50,000...", score: 88, engagement: "13.7%" }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickCreate = (content: any, type: string) => {
    console.log('Creating content:', type, content);
    navigate('/create');
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedScript({
        title: "How to Make $25,000 Wholesaling in 30 Days",
        hook: scriptConfig.hook || hooks[0].text,
        body: "Generated script content would appear here...",
        cta: "Subscribe for more real estate strategies",
        stats: {
          estimatedViews: "450-780K",
          engagementRate: "8.5-12.3%",
          outlierScore: 87,
          viralPotential: "High"
        },
        duration: "2:45",
        wordCount: 412
      });
      setGenerating(false);
      setScriptStep(4);
    }, 3000);
  };

  const renderDiscoverTab = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          >
            {niches.map(niche => (
              <option key={niche.id} value={niche.id}>
                {niche.name} ({niche.count})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {showFilters && <X className="w-3 h-3" />}
          </button>

          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>547 Trending Now</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Updated 5m ago</span>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {trendingContent.map(content => (
          <div
            key={content.id}
            className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 aspect-video flex items-center justify-center text-6xl">
              {content.thumbnail}
              <div className="absolute top-3 right-3 flex gap-2">
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded">
                  {content.platform}
                </span>
                <span className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                  {content.duration}
                </span>
              </div>
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-full">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold">{content.outlierScore}</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-600">{content.channel}</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Star className="w-5 h-5 text-gray-400 hover:text-amber-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                    <Eye className="w-3 h-3" />
                    Views
                  </div>
                  <div className="font-semibold text-gray-900">{content.views}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                    <ThumbsUp className="w-3 h-3" />
                    Engagement
                  </div>
                  <div className="font-semibold text-emerald-600">{content.engagement}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    Posted
                  </div>
                  <div className="font-semibold text-gray-900">{content.posted}</div>
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                  <Layout className="w-3 h-3" />
                  {content.style}
                </span>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-700">Top Hook</span>
                </div>
                <p className="text-sm text-gray-900 italic">"{content.hooks[0]}"</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickCreate(content, 'script')}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Create Script
                </button>
                <button
                  onClick={() => setSelectedContent(content)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analyze
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleCopy(content.hooks[0], `hook-${content.id}`)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  {copiedId === `hook-${content.id}` ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Hook
                    </>
                  )}
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View Original
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Load More Content
        </button>
      </div>
    </>
  );

  const renderAnalyzeTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h2>
          <p className="text-gray-600">Track trends, patterns, and winning strategies</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                metric.color === 'blue' ? 'bg-blue-50' :
                metric.color === 'emerald' ? 'bg-emerald-50' :
                metric.color === 'amber' ? 'bg-amber-50' :
                'bg-purple-50'
              }`}>
                <metric.icon className={`w-6 h-6 ${
                  metric.color === 'blue' ? 'text-blue-500' :
                  metric.color === 'emerald' ? 'text-emerald-500' :
                  metric.color === 'amber' ? 'text-amber-500' :
                  'text-purple-500'
                }`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metric.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option>Views</option>
              <option>Engagement</option>
              <option>Outlier Score</option>
            </select>
          </div>
          <div className="h-64 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg flex items-center justify-center">
            <Activity className="w-16 h-16 text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Type Distribution</h3>
          <div className="space-y-4">
            {contentTypes.map((type, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                  <span className="text-sm font-semibold text-gray-900">{type.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <div className="space-y-4">
            {topPerformers.map((item) => (
              <div key={item.rank} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                  item.rank === 1 ? 'bg-amber-500' : 
                  item.rank === 2 ? 'bg-gray-400' : 
                  'bg-orange-600'
                }`}>
                  {item.rank}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {item.score}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {item.engagement}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
          </div>
          <div className="space-y-4">
            {trendingTopics.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 mb-1">{item.topic}</div>
                  <div className="text-sm text-gray-600">{item.mentions} mentions</div>
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${
                  item.trend === 'up' ? 'text-emerald-600' : 
                  item.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {item.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {item.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {Math.abs(item.change)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderScriptsTab = () => (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Topic & Style' },
            { num: 2, label: 'Customize' },
            { num: 3, label: 'Hook Selection' },
            { num: 4, label: 'Generate' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  scriptStep >= s.num 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {scriptStep > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span className="text-sm mt-2 font-medium text-gray-700">{s.label}</span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                  scriptStep > s.num ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {scriptStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's your content about?</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Topic or Main Idea</label>
            <textarea
              value={scriptConfig.topic}
              onChange={(e) => setScriptConfig({ ...scriptConfig, topic: e.target.value })}
              placeholder="e.g., How to find off-market real estate deals using creative finance strategies"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">Content Style</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setScriptConfig({ ...scriptConfig, style: style.id })}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    scriptConfig.style === style.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{style.name}</div>
                  <div className="text-sm text-gray-600 mb-3">{style.description}</div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">Avg Score: {style.avgScore}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setScriptStep(2)}
            disabled={!scriptConfig.topic}
            className="w-full px-6 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            Next: Customize Settings
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      )}

      {scriptStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Script</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tone & Voice</label>
              <div className="space-y-2">
                {tones.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => setScriptConfig({ ...scriptConfig, tone: tone.id })}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                      scriptConfig.tone === tone.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{tone.emoji}</span>
                    <span className="font-medium text-gray-900">{tone.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Content Length</label>
              <div className="space-y-2">
                {lengths.map(length => (
                  <button
                    key={length.id}
                    onClick={() => setScriptConfig({ ...scriptConfig, length: length.id })}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      scriptConfig.length === length.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{length.name}</div>
                    <div className="text-sm text-gray-600">{length.duration} • {length.words} words</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScriptStep(1)}
              className="flex-1 px-6 py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setScriptStep(3)}
              className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              Next: Choose Hook
              <Target className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {scriptStep === 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Hook</h2>
          <p className="text-gray-600 mb-6">Select a proven hook or write your own</p>

          <div className="space-y-4 mb-6">
            {hooks.map((hook, idx) => (
              <button
                key={idx}
                onClick={() => setScriptConfig({ ...scriptConfig, hook: hook.text })}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                  scriptConfig.hook === hook.text
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-gray-900 font-medium flex-1 mr-4">"{hook.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-bold">{hook.score}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {hook.engagement} engagement
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    High viral potential
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScriptStep(2)}
              className="flex-1 px-6 py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!scriptConfig.hook}
              className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              Generate Script
              <Wand2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {generating && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Your Script...</h2>
          <p className="text-gray-600 mb-6">Our AI is analyzing top-performing content and crafting your script</p>
        </div>
      )}

      {scriptStep === 4 && generatedScript && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Est. Views</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{generatedScript.stats.estimatedViews}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-600">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{generatedScript.stats.engagementRate}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-600">Outlier Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{generatedScript.stats.outlierScore}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Viral Potential</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{generatedScript.stats.viralPotential}</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{generatedScript.title}</h3>
            <div className="p-4 bg-emerald-50 rounded-lg mb-4">
              <p className="text-emerald-800 font-medium">"{generatedScript.hook}"</p>
            </div>
            <p className="text-gray-600 mb-4">{generatedScript.body}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleQuickCreate(generatedScript, 'video')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Create Video
              </button>
              <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Copy Script
              </button>
              <button
                onClick={() => { setScriptStep(1); setGeneratedScript(null); }}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                New Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWatchlistsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Watchlists</h2>
        <button className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Watchlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Real Estate Investing", channels: 25, newVideos: 47 },
          { name: "Wholesaling Strategies", channels: 18, newVideos: 23 },
          { name: "Creative Finance", channels: 12, newVideos: 15 }
        ].map((watchlist, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{watchlist.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Channels</span>
                <span className="font-semibold text-gray-900">{watchlist.channels}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">New Videos</span>
                <span className="font-semibold text-emerald-600">{watchlist.newVideos}</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              View Videos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVaultTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Vault</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { type: 'Hook', content: "What nobody tells you about wholesaling...", saved: "2 hours ago", score: 94 },
          { type: 'Script', content: "Creative Finance Deal Breakdown", saved: "1 day ago", score: 91 },
          { type: 'Hook', content: "I was broke 30 days ago, now...", saved: "3 days ago", score: 92 }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.type === 'Hook' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {item.score}
                  </span>
                </div>
                <p className="text-gray-900 font-medium mb-2">"{item.content}"</p>
                <span className="text-sm text-gray-500">Saved {item.saved}</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Spy</h1>
                  <p className="text-gray-600">Discover, analyze, and create winning content based on proven strategies</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Sync Data
                  </button>
                  <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Watchlist
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by topic, channel, or keyword..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-6 border-b border-gray-200">
                {[
                  { id: 'discover', label: 'Discover', icon: Sparkles },
                  { id: 'analyze', label: 'Analyze', icon: BarChart3 },
                  { id: 'scripts', label: 'Scripts', icon: Edit3 },
                  { id: 'watchlists', label: 'Watchlists', icon: Star },
                  { id: 'vault', label: 'Vault', icon: BookmarkPlus }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 px-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-emerald-500 text-emerald-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {activeTab === 'discover' && renderDiscoverTab()}
            {activeTab === 'analyze' && renderAnalyzeTab()}
            {activeTab === 'scripts' && renderScriptsTab()}
            {activeTab === 'watchlists' && renderWatchlistsTab()}
            {activeTab === 'vault' && renderVaultTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DigitalSpy;
