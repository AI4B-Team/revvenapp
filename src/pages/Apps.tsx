import { useState } from 'react';
import { 
  Search, Play, ExternalLink, TrendingUp, 
  Sparkles, Image as ImageIcon, Video, Music, MessageSquare,
  BarChart, Palette
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Apps = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
    { id: 'ai-generation', label: 'AI Generation', icon: <Sparkles size={16} /> },
    { id: 'photo-editing', label: 'Photo Editing', icon: <ImageIcon size={16} /> },
    { id: 'video', label: 'Video & Animation', icon: <Video size={16} /> },
    { id: 'audio', label: 'Audio & Voice', icon: <Music size={16} /> },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={16} /> },
    { id: 'marketing', label: 'Marketing', icon: <BarChart size={16} /> },
    { id: 'design', label: 'Graphic Design', icon: <Palette size={16} /> }
  ];

  const trendingApps = [
    {
      id: 1,
      name: 'Video Face Swap',
      description: 'Best-in-class face swapping technology for any video',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop',
      badge: 'NEW',
      badgeColor: 'bg-green-500'
    },
    {
      id: 2,
      name: 'Recast',
      description: 'Industry-leading character swap for any video in seconds',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
      badge: 'TOP',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 3,
      name: 'Transitions',
      description: 'Create seamless transitions between any shots effortlessly',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      badge: 'TOP',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 4,
      name: 'Face Swap',
      description: 'The best instant AI face swap technology for photos',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=400&fit=crop',
      badge: 'NEW',
      badgeColor: 'bg-green-500'
    }
  ];

  const topPicks = [
    {
      id: 1,
      name: 'Flourish',
      description: 'Inspire with charts and more',
      icon: '📊',
      color: 'bg-blue-500',
      category: 'Data Visualization'
    },
    {
      id: 2,
      name: 'Leonardo.AI',
      description: 'A tool for limitless creativity',
      icon: '🎨',
      color: 'bg-purple-600',
      category: 'AI Generation'
    },
    {
      id: 3,
      name: 'Instagram',
      description: 'Design your feed in Canva',
      icon: '📷',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      category: 'Social Media'
    },
    {
      id: 4,
      name: 'Mailchimp',
      description: 'Elevated email campaigns',
      icon: '🐵',
      color: 'bg-yellow-500',
      category: 'Marketing'
    }
  ];

  const appCategories = [
    {
      title: 'AI Generation',
      subtitle: 'Catch up on the newest and hottest releases',
      apps: [
        { name: 'AI Slides Maker', description: 'Create stunning slides from text, video & docs', icon: '📽️', color: 'bg-orange-500' },
        { name: 'AI Image Gen', description: 'Generate images using AI', icon: '🖼️', color: 'bg-blue-600' },
        { name: 'Mojo AI', description: 'Bring all into your designs', icon: '✨', color: 'bg-purple-500' }
      ]
    },
    {
      title: 'Audio and voiceover',
      subtitle: 'Enhance your content with professional audio',
      apps: [
        { name: 'AI Music', description: 'Custom music for your designs', icon: '🎵', color: 'bg-blue-400' },
        { name: 'Voice AI', description: 'Generate studio-quality voices with AI', icon: '🎤', color: 'bg-purple-400' },
        { name: 'Voice Studio', description: 'Generate high-quality voiceovers with AI', icon: '🎙️', color: 'bg-orange-400' }
      ]
    },
    {
      title: 'Communication',
      subtitle: 'Connect and collaborate',
      apps: [
        { name: 'Instagram', description: 'Prepare and publish Carousels, Reels and Stories', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
        { name: 'CreateCards', description: 'Create & send invites, track RSVPs for any event', icon: '💌', color: 'bg-purple-300' },
        { name: 'Facebook', description: 'Add your Facebook photos to your designs', icon: 'f', color: 'bg-blue-600' }
      ]
    },
    {
      title: 'Photo editing',
      subtitle: 'Professional photo editing tools',
      apps: [
        { name: 'Image Blender', description: 'Effortlessly merge or blend images in Canva', icon: '🎨', color: 'bg-purple-500' },
        { name: 'Pixelify', description: 'Make your images look pixelated', icon: '🔲', color: 'bg-pink-500' },
        { name: 'Reface', description: 'AI-powered face swap app for images/portraits', icon: '😊', color: 'bg-blue-400' }
      ]
    },
    {
      title: 'Video & Animation',
      subtitle: 'Create stunning motion graphics',
      apps: [
        { name: 'Lottie Animations', description: "World's largest motion-editable animation library", icon: '🎬', color: 'bg-teal-500' },
        { name: 'D-ID Avatars', description: 'Instantly add a talking head video to your designs', icon: '🗣️', color: 'bg-gray-700' },
        { name: 'YouTube Embed', description: 'Add YouTube videos to your designs', icon: '▶️', color: 'bg-red-600' }
      ]
    },
    {
      title: 'Graphic Design',
      subtitle: 'Design tools and resources',
      apps: [
        { name: 'Chappy Crop', description: 'Crop your images in custom shapes', icon: '✂️', color: 'bg-indigo-600' },
        { name: 'CanBorder', description: 'Create borders for your designs', icon: '🖼️', color: 'bg-red-500' },
        { name: 'Frame Maker', description: 'Create custom frames & image masks in Canva', icon: '🎯', color: 'bg-green-400' }
      ]
    },
    {
      title: 'Marketing',
      subtitle: 'Boost your campaigns',
      apps: [
        { name: 'Gen QR', description: 'Design versatile QR codes', icon: '📱', color: 'bg-gray-800' },
        { name: 'Brandfetch', description: 'Search and add brand logos to your designs', icon: 'B', color: 'bg-black' },
        { name: 'QR Code with Logo', description: 'Create QR codes with your logo and colors', icon: '🔳', color: 'bg-blue-700' }
      ]
    }
  ];

  const filteredCategories = selectedCategory === 'all' 
    ? appCategories 
    : appCategories.filter(cat => cat.title.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="px-8 py-12 border-b border-border">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-5xl font-bold mb-4">
                <span className="text-primary">REVVEN APPS</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                One-click AI effects that transform any content into professional ads, viral trends, or artistic masterpieces
              </p>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-12">
            <div className="max-w-7xl mx-auto space-y-16">
              
              {/* Trending Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">TRENDING</h2>
                  <p className="text-muted-foreground">The hottest AI effects right now</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingApps.map((app) => (
                    <div
                      key={app.id}
                      className="group relative bg-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer border border-border"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3]">
                        <img
                          src={app.image}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Badge */}
                        {app.badge && (
                          <div className={`absolute top-4 left-4 ${app.badgeColor} text-black font-bold text-xs px-3 py-1 rounded-full`}>
                            {app.badge}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{app.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{app.description}</p>
                        
                        {/* Try Now Button */}
                        <button className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Play size={16} fill="currentColor" />
                          <span>Try Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Picks Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">TOP PICKS FOR YOU</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topPicks.map((app) => (
                    <div
                      key={app.id}
                      className="bg-card rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-border"
                    >
                      <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                        {app.icon}
                      </div>
                      <h3 className="font-bold mb-1">{app.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{app.description}</p>
                      <span className="text-xs text-muted-foreground">{app.category}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tools from Create Page */}
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">IMAGE APPS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Art Blocks', description: 'AI create some art works', bgColor: 'bg-tool-blue', emoji: '🎨' },
                    { name: 'Background Remover', description: 'Remove backgrounds', bgColor: 'bg-tool-yellow', emoji: '✂️' },
                    { name: 'Image Eraser', description: 'Erase parts of images', bgColor: 'bg-tool-blue', emoji: '🖼️' },
                    { name: 'Image Upscaler', description: 'Enhance image quality', bgColor: 'bg-tool-yellow', emoji: '📸' },
                    { name: 'Image Enhancer', description: 'Improve image details', bgColor: 'bg-tool-blue', emoji: '❤️' },
                    { name: 'Image Colorizer', description: 'Add color to images', bgColor: 'bg-tool-gray', emoji: '🌹' },
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-white">{tool.name}</h3>
                      <p className="text-xs text-white/80">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">VIDEO APPS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Video Downloader', description: 'Download videos', bgColor: 'bg-tool-blue', emoji: '📥' },
                    { name: 'Video Resizer', description: 'Resize video dimensions', bgColor: 'bg-tool-pink', emoji: '📐' },
                    { name: 'Motion-Sync', description: 'Sync video motion', bgColor: 'bg-tool-yellow', emoji: '🎬' },
                    { name: 'Explainer Video', description: 'Create educational videos', bgColor: 'bg-tool-blue', emoji: '🎬' },
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-white">{tool.name}</h3>
                      <p className="text-xs text-white/80">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">AUDIO APPS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'AI Voice Cloner', description: 'Clone any voice', bgColor: 'bg-tool-blue', emoji: '🎤' },
                    { name: 'AI Transcriber', description: 'Transcribe audio to text', bgColor: 'bg-tool-pink', emoji: '📝' },
                    { name: 'AI Voice Changer', description: 'Transform voice style', bgColor: 'bg-tool-blue', emoji: '🎵' },
                    { name: 'AI Voiceovers', description: 'Generate voiceovers', bgColor: 'bg-tool-yellow', emoji: '🎬' },
                    { name: 'AI Audio Dubber', description: 'Dub audio tracks', bgColor: 'bg-tool-blue', emoji: '🎧' },
                    { name: 'AI Noise Remover', description: 'Remove background noise', bgColor: 'bg-tool-yellow', emoji: '🔇' },
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-white">{tool.name}</h3>
                      <p className="text-xs text-white/80">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">DESIGN APPS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Logo Designer', description: 'Create brand logos', bgColor: 'bg-tool-blue', emoji: '🎨' },
                    { name: 'Banner Creator', description: 'Design social banners', bgColor: 'bg-tool-yellow', emoji: '🖼️' },
                    { name: 'Flyer Maker', description: 'Create marketing flyers', bgColor: 'bg-tool-green', emoji: '📄' },
                    { name: 'Poster Designer', description: 'Design custom posters', bgColor: 'bg-tool-blue', emoji: '🎭' },
                    { name: 'Infographic Builder', description: 'Create infographics', bgColor: 'bg-tool-pink', emoji: '📊' },
                    { name: 'Presentation Maker', description: 'Design presentations', bgColor: 'bg-tool-yellow', emoji: '📺' },
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-white">{tool.name}</h3>
                      <p className="text-xs text-white/80">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">CONTENT APPS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Blog Writer', description: 'Generate blog posts', bgColor: 'bg-tool-green', emoji: '✍️' },
                    { name: 'Social Posts', description: 'Create social content', bgColor: 'bg-tool-blue', emoji: '📱' },
                    { name: 'Email Generator', description: 'Write email campaigns', bgColor: 'bg-tool-yellow', emoji: '📧' },
                    { name: 'Ad Copy Writer', description: 'Generate ad copy', bgColor: 'bg-tool-pink', emoji: '💡' },
                    { name: 'Script Writer', description: 'Create video scripts', bgColor: 'bg-tool-blue', emoji: '🎬' },
                    { name: 'SEO Optimizer', description: 'Optimize for search', bgColor: 'bg-tool-green', emoji: '🔍' },
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-white">{tool.name}</h3>
                      <p className="text-xs text-white/80">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* App Categories */}
              {filteredCategories.map((category, idx) => (
                <section key={idx}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{category.title}</h2>
                      <p className="text-muted-foreground">{category.subtitle}</p>
                    </div>
                    <button className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition-colors">
                      <span>See all</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.apps.map((app, appIdx) => (
                      <div
                        key={appIdx}
                        className="flex items-start gap-4 p-4 bg-card hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group border border-border"
                      >
                        <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                          {app.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
                            {app.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {app.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Apps;
