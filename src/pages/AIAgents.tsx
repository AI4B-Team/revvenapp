import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

const AIAgentsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Content');

  const categories = ['All', 'Content', 'Image', 'Video', 'Audio', 'Marketing'];

  // AI Agent/Template Cards
  const aiAgents = [
    {
      category: 'Marketing',
      name: 'Marketing Agent',
      description: 'Plan and execute comprehensive marketing strategies',
      image: '📊',
      color: 'bg-blue-50',
      accentColor: 'bg-blue-500'
    },
    {
      category: 'Content',
      name: 'Research Agent',
      description: 'Conduct in-depth research and analysis on any topic',
      image: '🔬',
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500'
    },
    {
      category: 'Content',
      name: 'Copy Writer',
      description: 'Write persuasive copy for any marketing material',
      image: '✍️',
      color: 'bg-pink-50',
      accentColor: 'bg-pink-500'
    },
    {
      category: 'Content',
      name: 'Content Manager',
      description: 'Organize and manage all your content creation workflows',
      image: '📋',
      color: 'bg-orange-50',
      accentColor: 'bg-orange-500'
    },
    {
      category: 'Marketing',
      name: 'Social Media Manager',
      description: 'Manage and grow your social media presence across platforms',
      image: '📱',
      color: 'bg-teal-50',
      accentColor: 'bg-teal-500'
    },
    {
      category: 'Marketing',
      name: 'Media Buyer',
      description: 'Plan and optimize paid media campaigns for maximum ROI',
      image: '💳',
      color: 'bg-indigo-50',
      accentColor: 'bg-indigo-500'
    },
    {
      category: 'Content',
      name: 'Blog Writer Agent',
      description: 'Create engaging blog posts with AI-powered writing assistance',
      image: '📝',
      color: 'bg-blue-50',
      accentColor: 'bg-blue-500'
    },
    {
      category: 'Content',
      name: 'Social Media Agent',
      description: 'Generate captivating social media posts for all platforms',
      image: '📱',
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500'
    },
    {
      category: 'Image',
      name: 'Product Photo Agent',
      description: 'Create professional product photography with AI',
      image: '📸',
      color: 'bg-pink-50',
      accentColor: 'bg-pink-500'
    },
    {
      category: 'Image',
      name: 'Portrait Generator',
      description: 'Generate stunning portrait images for any purpose',
      image: '🎨',
      color: 'bg-orange-50',
      accentColor: 'bg-orange-500'
    },
    {
      category: 'Video',
      name: 'Explainer Video Agent',
      description: 'Create educational videos that explain complex topics',
      image: '🎬',
      color: 'bg-red-50',
      accentColor: 'bg-red-500'
    },
    {
      category: 'Video',
      name: 'Marketing Video Agent',
      description: 'Generate promotional videos for your business',
      image: '📹',
      color: 'bg-yellow-50',
      accentColor: 'bg-yellow-500'
    },
    {
      category: 'Audio',
      name: 'Podcast Producer',
      description: 'Create and edit podcast episodes with AI assistance',
      image: '🎙️',
      color: 'bg-green-50',
      accentColor: 'bg-green-500'
    },
    {
      category: 'Audio',
      name: 'Music Composer',
      description: 'Generate original music tracks for any project',
      image: '🎵',
      color: 'bg-teal-50',
      accentColor: 'bg-teal-500'
    },
    {
      category: 'Marketing',
      name: 'Email Campaign Agent',
      description: 'Design and optimize email marketing campaigns',
      image: '✉️',
      color: 'bg-indigo-50',
      accentColor: 'bg-indigo-500'
    },
    {
      category: 'Marketing',
      name: 'Ad Copy Generator',
      description: 'Create compelling ad copy that converts',
      image: '💰',
      color: 'bg-violet-50',
      accentColor: 'bg-violet-500'
    },
    {
      category: 'Content',
      name: 'SEO Content Agent',
      description: 'Write SEO-optimized content that ranks',
      image: '🔍',
      color: 'bg-cyan-50',
      accentColor: 'bg-cyan-500'
    },
    {
      category: 'Video',
      name: 'Short Form Agent',
      description: 'Create viral short-form videos for TikTok & Reels',
      image: '📲',
      color: 'bg-rose-50',
      accentColor: 'bg-rose-500'
    },
  ];

  const filteredAgents = activeCategory === 'All' 
    ? aiAgents 
    : aiAgents.filter(agent => agent.category === activeCategory);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="px-8 py-8">
            {/* Category Filter */}
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 max-w-7xl mx-auto">
              {filteredAgents.map((agent, idx) => (
                <div
                  key={idx}
                  className={`${agent.color} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group relative`}
                >
                  {/* AI Badge */}
                  <div className={`absolute top-4 right-4 ${agent.accentColor} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                    AI
                  </div>
                  
                  {/* Icon */}
                  <div className="text-6xl mb-4">
                    {agent.image}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {agent.description}
                  </p>
                  
                  {/* CTA */}
                  <button className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                    <span>Try Agent</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold inline-flex items-center gap-2 transition">
                View All Agent Templates
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAgentsPage;
