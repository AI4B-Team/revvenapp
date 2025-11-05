import React, { useState } from 'react';
import { 
  Sparkles, Video, Image as ImageIcon, Music, FileText, Wand2,
  Calendar, MessageSquare, Mail, Search, Zap, Play, Link2, 
  Settings, ChevronRight, Check, Star
} from 'lucide-react';

const AIAgentsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Content', 'Image', 'Video', 'Audio', 'Marketing'];

  // AI Agent/Template Cards
  const aiAgents = [
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

  // AI Tools/Features
  const aiTools = [
    {
      icon: <Calendar size={24} />,
      name: 'Schedule Content',
      description: 'Automatically schedule your content across platforms'
    },
    {
      icon: <Zap size={24} />,
      name: 'Trigger Workflows',
      description: 'Start predefined workflows with your AI agent'
    },
    {
      icon: <Play size={24} />,
      name: 'Share Media',
      description: 'Let your agent share relevant videos and images'
    },
    {
      icon: <Link2 size={24} />,
      name: 'Generate Links',
      description: 'Create shareable links for your content'
    },
    {
      icon: <Search size={24} />,
      name: 'Web Search',
      description: 'Search the web for relevant information'
    },
    {
      icon: <Mail size={24} />,
      name: 'Send Email',
      description: 'Compose and send emails automatically'
    },
    {
      icon: <MessageSquare size={24} />,
      name: 'Send Messages',
      description: 'Send messages via Slack, Teams, or SMS'
    },
    {
      icon: <Settings size={24} />,
      name: 'API Integration',
      description: 'Connect with external APIs and services'
    },
  ];

  const filteredAgents = activeCategory === 'All' 
    ? aiAgents 
    : aiAgents.filter(agent => agent.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      {/* Hero Section */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>AI-Powered Content Creation</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Revven AI Agents
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-4">
            The Future of Content Creation
          </p>
          
          <p className="text-lg text-gray-500 mb-10 max-w-3xl mx-auto">
            Imagine a world where you can create professional content instantly, anytime, anywhere. 
            Our AI agents handle everything from blog posts to videos, images to music.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition">
              <Sparkles size={20} />
              <span>Try it Now - It's Free!</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-300 transition">
              View Demo
            </button>
          </div>
        </div>

        {/* Hero Image/Animation */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl p-8 lg:p-12">
            <div className="bg-white rounded-xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Sara - Content Agent</h3>
                  <p className="text-sm text-gray-500">Creating your blog post...</p>
                </div>
              </div>
              <div className="space-y-3 text-left text-gray-700">
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <span>Researched top trending topics in your niche</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <span>Generated SEO-optimized headline and outline</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <span>Writing 2,000-word article with proper formatting</span>
                </div>
                <div className="flex items-start gap-2 opacity-50">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded animate-spin mt-0.5" />
                  <span>Adding relevant images and graphics...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Types Section */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
            1,000+ AI Agent Templates
          </h2>
          <p className="text-lg text-gray-600 text-center mb-10 max-w-3xl mx-auto">
            Whether you're writing content, creating images, or producing videos, 
            our AI Agents are here to streamline your creative process.
          </p>

          {/* Category Filter */}
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full font-medium transition ${
                  activeCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredAgents.map((agent, idx) => (
              <div
                key={idx}
                className={`${agent.color} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden`}
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition">
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
            <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition">
              View All Agent Templates
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
            Boost Your AI Agents with Powerful Tools
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Effortlessly automate tasks — like scheduling, messaging, searching, and more — in just a few clicks.
          </p>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {aiTools.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {tool.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold text-lg inline-flex items-center gap-2 transition">
              <Sparkles size={20} />
              Create Your AI Agent Today
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The AI Agent has been a game-changer for my business. It's like having my knowledge 
                cloned and available 24/7. This has freed me up to focus on other crucial tasks."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">Content Creator</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Revven AI streamlines content creation and automates responses effortlessly. 
                A must-have for efficiency and productivity!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">Michael Chen</div>
                  <div className="text-sm text-gray-600">Marketing Director</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "I found the tool to be intuitive, thoughtfully designed, and a real joy to use. 
                I'll continue using Revven for all my content creation needs."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">Emily Rodriguez</div>
                  <div className="text-sm text-gray-600">Business Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Content Creation?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join thousands of creators using Revven AI Agents to produce amazing content faster than ever.
          </p>
          <button className="px-10 py-5 bg-white hover:bg-gray-100 text-purple-600 rounded-lg font-bold text-lg inline-flex items-center gap-3 transition shadow-xl">
            <Sparkles size={24} />
            <span>Get Started Free</span>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AIAgentsPage;
