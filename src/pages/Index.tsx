import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';
import { 
  Zap, Send, Users, Gem, MessageCircle, Plus, Calendar, 
  Settings, ChevronRight, Instagram
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [activeView, setActiveView] = useState<'tools' | 'creations' | 'community'>('tools');
  
  const timeFilters = ['All Time', '7 Days', '30 Days', '12 Months'];

  // Stats data
  const stats = [
    {
      title: 'Total Posts',
      value: '9',
      lastMonth: '0 last month',
      total: '9 total',
      icon: <Zap size={24} />,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Post Published',
      value: '7',
      lastMonth: '0 last month',
      total: '7 total',
      icon: <Send size={24} />,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50'
    },
    {
      title: 'New Leads',
      value: '0',
      lastMonth: '0 last month',
      total: '0 total',
      icon: <Users size={24} />,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-50'
    },
    {
      title: 'AI Conversations',
      value: '2',
      lastMonth: '0 last month',
      total: '2 total',
      icon: <Gem size={24} />,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50'
    }
  ];

  // Quick Actions data
  const quickActions = [
    {
      title: 'Chat With AI',
      description: 'Chat with your AI employee to get work done',
      icon: <MessageCircle size={24} />,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'AI Social Campaigns',
      description: 'Show up and share daily without burn out',
      icon: <Plus size={24} />,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Schedule A Post',
      description: 'Plan your social media content',
      icon: <Calendar size={24} />,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Brand Settings',
      description: 'Optimize brand goals to keep your agents aligned',
      icon: <Settings size={24} />,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    }
  ];

  // Upcoming Posts data
  const upcomingPosts = [
    {
      date: 'NOV 08',
      title: 'A MUST Know 👇 AI is changing how businesses communicate with you. Here...',
      platform: 'itszarasaige',
      type: 'reel',
      emoji: '👇'
    },
    {
      date: 'NOV 08',
      title: 'Let me show you HOW ⬇️ 📊Research and Niche - Identify a profitable niche ...',
      platform: 'itszarasaige',
      type: 'reel',
      emoji: '⬇️'
    }
  ];

  const imageTools = [
    { 
      name: 'Art Blocks', 
      description: 'AI create some art works',
      bgColor: 'bg-tool-blue',
      emoji: '🎨'
    },
    { 
      name: 'Background Remover', 
      description: 'Remove backgrounds',
      bgColor: 'bg-tool-yellow',
      emoji: '✂️'
    },
    { 
      name: 'Image Eraser', 
      description: 'Erase parts of images',
      bgColor: 'bg-tool-blue',
      emoji: '🖼️'
    },
    { 
      name: 'Image Upscaler', 
      description: 'Enhance image quality',
      bgColor: 'bg-tool-yellow',
      emoji: '📸'
    },
    { 
      name: 'Image Enhancer', 
      description: 'Improve image details',
      bgColor: 'bg-tool-blue',
      emoji: '❤️'
    },
    { 
      name: 'Image Colorizer', 
      description: 'Add color to images',
      bgColor: 'bg-tool-gray',
      emoji: '🌹'
    },
  ];

  const videoTools = [
    { 
      name: 'Video Downloader', 
      description: 'Download videos',
      bgColor: 'bg-tool-blue',
      emoji: '📥'
    },
    { 
      name: 'Video Resizer', 
      description: 'Resize video dimensions',
      bgColor: 'bg-tool-pink',
      emoji: '📐'
    },
    { 
      name: 'Motion-Sync', 
      description: 'Sync video motion',
      bgColor: 'bg-tool-yellow',
      emoji: '🎬'
    },
    { 
      name: 'Explainer Video', 
      description: 'Create educational videos',
      bgColor: 'bg-tool-blue',
      emoji: '🎬'
    },
  ];

  const audioTools = [
    { 
      name: 'AI Voice Cloner', 
      description: 'Clone any voice',
      bgColor: 'bg-tool-blue',
      emoji: '🎤'
    },
    { 
      name: 'AI Transcriber', 
      description: 'Transcribe audio to text',
      bgColor: 'bg-tool-pink',
      emoji: '📝'
    },
    { 
      name: 'AI Voice Changer', 
      description: 'Transform voice style',
      bgColor: 'bg-tool-blue',
      emoji: '🎵'
    },
    { 
      name: 'AI Voiceovers', 
      description: 'Generate voiceovers',
      bgColor: 'bg-tool-yellow',
      emoji: '🎬'
    },
    { 
      name: 'AI Audio Dubber', 
      description: 'Dub audio tracks',
      bgColor: 'bg-tool-blue',
      emoji: '🎧'
    },
    { 
      name: 'AI Noise Remover', 
      description: 'Remove background noise',
      bgColor: 'bg-tool-yellow',
      emoji: '🔇'
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedType(tab);
      }} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onCreateClick={() => setSelectedType(selectedType || 'Content')} />
        
        <main className="flex-1 overflow-auto bg-white">
          {(activeTab || selectedType) ? (
            <div className="px-8 py-8">
              <h1 className="text-5xl font-bold text-center mb-8">What Would You Like To Create Today?</h1>
              
              <ContentTypeSelector selectedType={selectedType || activeTab} onTypeChange={(type) => {
                setSelectedType(type);
                setActiveTab(type);
              }} />
              
              <GenerationInput selectedType={selectedType || activeTab} />
              
              <ActionButtons activeView={activeView} onViewChange={setActiveView} />
              
              {/* Image Tools Section */}
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">IMAGE TOOLS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {imageTools.map((tool, idx) => (
                    <ToolCard key={idx} {...tool} />
                  ))}
                </div>

                {/* Video Tools Section */}
                <h2 className="text-2xl font-bold mb-6">VIDEO TOOLS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {videoTools.map((tool, idx) => (
                    <ToolCard key={idx} {...tool} />
                  ))}
                </div>

                {/* Audio Tools Section */}
                <h2 className="text-2xl font-bold mb-6">AUDIO TOOLS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {audioTools.map((tool, idx) => (
                    <ToolCard key={idx} {...tool} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                
                {/* Header with Greeting */}
                <div className="relative bg-white px-8 py-12 rounded-2xl overflow-hidden mb-8">
                  {/* Purple Gradient Orb */}
                  <div className="absolute right-20 top-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full blur-xl opacity-60"></div>

                  {/* Content */}
                  <div className="relative z-10 max-w-4xl">
                    <p className="text-base text-gray-600 mb-4 font-medium">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </p>
                    
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">
                      Hello, Brian 👋
                    </h1>
                    
                    <h2 className="text-5xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                      How Can I Help You Today?
                    </h2>
                  </div>
                  
                  {/* Time Filter Buttons */}
                  <div className="relative z-10 flex items-center gap-2 bg-gray-50 rounded-lg p-1 shadow-sm border border-gray-200 mt-6 w-fit">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          timeFilter === filter
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-600 mb-1">
                            {stat.title}
                          </h3>
                        </div>
                        <div className={`${stat.iconBg} ${stat.iconColor} p-2 rounded-lg`}>
                          {stat.icon}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-4xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          {stat.lastMonth}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stat.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Section - Quick Actions & Upcoming Posts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Quick Actions - Takes 2 columns */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            className="flex items-start gap-4 p-5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-gray-200"
                          >
                            <div className={`${action.iconBg} ${action.iconColor} p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
                              {action.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 text-base">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {action.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Posts - Takes 1 column */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Upcoming Posts</h2>
                        <button className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors">
                          View all
                        </button>
                      </div>

                      <div className="space-y-3">
                        {upcomingPosts.map((post, idx) => (
                          <div
                            key={idx}
                            className="group cursor-pointer"
                          >
                            <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                              {/* Date Badge */}
                              <div className="shrink-0 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  {post.date.split(' ')[0]}
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                  {post.date.split(' ')[1]}
                                </div>
                              </div>

                              {/* Post Content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                                  {post.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Instagram size={12} className="text-white" />
                                  </div>
                                  <span className="text-gray-600">{post.platform}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-600">{post.type}</span>
                                </div>
                              </div>

                              {/* Arrow */}
                              <ChevronRight 
                                size={20} 
                                className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all shrink-0 mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Empty State (if no posts) */}
                      {upcomingPosts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No upcoming posts scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
