import { useState } from 'react';
import { 
  Play, ChevronRight
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Apps = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

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
    },
    {
      id: 5,
      name: 'AI Upscaler',
      description: 'Enhance video and image quality to 4K resolution instantly',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      badge: 'HOT',
      badgeColor: 'bg-red-500'
    }
  ];

  const topPicks = [
    {
      id: 1,
      name: 'Background Remover',
      description: 'Remove backgrounds instantly',
      icon: '✂️',
      color: 'bg-yellow-500'
    },
    {
      id: 2,
      name: 'Video Resizer',
      description: 'Resize videos for any platform',
      icon: '📐',
      color: 'bg-pink-500'
    },
    {
      id: 3,
      name: 'Logo Designer',
      description: 'Create stunning brand logos',
      icon: '🎨',
      color: 'bg-blue-500'
    },
    {
      id: 4,
      name: 'Blog Writer',
      description: 'Generate engaging blog posts',
      icon: '✍️',
      color: 'bg-green-500'
    }
  ];


  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="px-8 py-12 border-b border-border">
            <div className="w-full">
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-primary">APPS</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                A full suite of intelligent AI Apps to help you create like a pro.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-12">
            <div className="w-full space-y-16">
              
              {/* Trending Section */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">TRENDING</h2>
                    <p className="text-muted-foreground">The hottest AI effects right now</p>
                  </div>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, trending: !expandedSections.trending })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
                        <h3 className="font-bold text-lg mb-2 text-black">{app.name}</h3>
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
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold mb-2">TOP PICKS FOR YOU</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, topPicks: !expandedSections.topPicks })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
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
                      <h3 className="font-bold mb-1 text-black">{app.name}</h3>
                      <p className="text-black text-sm">{app.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tools from Create Page */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">IMAGE APPS</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, imageApps: !expandedSections.imageApps })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Art Blocks', description: 'AI create some art works', bgColor: 'bg-tool-blue', emoji: '🎨' },
                    { name: 'Background Remover', description: 'Remove backgrounds', bgColor: 'bg-tool-yellow', emoji: '✂️' },
                    { name: 'Image Eraser', description: 'Erase parts of images', bgColor: 'bg-tool-blue', emoji: '🖼️' },
                    { name: 'Image Upscaler', description: 'Enhance image quality', bgColor: 'bg-tool-yellow', emoji: '📸' },
                    { name: 'Image Enhancer', description: 'Improve image details', bgColor: 'bg-tool-blue', emoji: '❤️' },
                    { name: 'Image Colorizer', description: 'Add color to images', bgColor: 'bg-tool-gray', emoji: '🌹' },
                    ...(expandedSections.imageApps ? [
                      { name: 'Photo Editor', description: 'Edit photos professionally', bgColor: 'bg-tool-blue', emoji: '📷' },
                      { name: 'Collage Maker', description: 'Create photo collages', bgColor: 'bg-tool-yellow', emoji: '🖼️' },
                      { name: 'Filter Studio', description: 'Apply artistic filters', bgColor: 'bg-tool-blue', emoji: '🎨' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">VIDEO APPS</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, videoApps: !expandedSections.videoApps })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Video Downloader', description: 'Download videos', bgColor: 'bg-tool-blue', emoji: '📥' },
                    { name: 'Video Resizer', description: 'Resize video dimensions', bgColor: 'bg-tool-pink', emoji: '📐' },
                    { name: 'Motion-Sync', description: 'Sync video motion', bgColor: 'bg-tool-yellow', emoji: '🎬' },
                    { name: 'Explainer Video', description: 'Create educational videos', bgColor: 'bg-tool-blue', emoji: '🎬' },
                    ...(expandedSections.videoApps ? [
                      { name: 'Video Trimmer', description: 'Cut and trim videos', bgColor: 'bg-tool-blue', emoji: '✂️' },
                      { name: 'Video Merger', description: 'Merge multiple videos', bgColor: 'bg-tool-yellow', emoji: '🎞️' },
                      { name: 'Subtitle Editor', description: 'Add and edit subtitles', bgColor: 'bg-tool-pink', emoji: '📝' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">AUDIO APPS</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, audioApps: !expandedSections.audioApps })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'AI Voice Cloner', description: 'Clone any voice', bgColor: 'bg-tool-blue', emoji: '🎤' },
                    { name: 'AI Transcriber', description: 'Transcribe audio to text', bgColor: 'bg-tool-pink', emoji: '📝' },
                    { name: 'AI Voice Changer', description: 'Transform voice style', bgColor: 'bg-tool-blue', emoji: '🎵' },
                    { name: 'AI Voiceovers', description: 'Generate voiceovers', bgColor: 'bg-tool-yellow', emoji: '🎬' },
                    { name: 'AI Audio Dubber', description: 'Dub audio tracks', bgColor: 'bg-tool-blue', emoji: '🎧' },
                    { name: 'AI Noise Remover', description: 'Remove background noise', bgColor: 'bg-tool-yellow', emoji: '🔇' },
                    ...(expandedSections.audioApps ? [
                      { name: 'Audio Mixer', description: 'Mix audio tracks', bgColor: 'bg-tool-blue', emoji: '🎛️' },
                      { name: 'Beat Maker', description: 'Create custom beats', bgColor: 'bg-tool-pink', emoji: '🥁' },
                      { name: 'Podcast Editor', description: 'Edit podcast episodes', bgColor: 'bg-tool-yellow', emoji: '🎙️' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">DESIGN APPS</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, designApps: !expandedSections.designApps })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Logo Designer', description: 'Create brand logos', bgColor: 'bg-tool-blue', emoji: '🎨' },
                    { name: 'Banner Creator', description: 'Design social banners', bgColor: 'bg-tool-yellow', emoji: '🖼️' },
                    { name: 'Flyer Maker', description: 'Create marketing flyers', bgColor: 'bg-tool-green', emoji: '📄' },
                    { name: 'Poster Designer', description: 'Design custom posters', bgColor: 'bg-tool-blue', emoji: '🎭' },
                    { name: 'Infographic Builder', description: 'Create infographics', bgColor: 'bg-tool-pink', emoji: '📊' },
                    { name: 'Presentation Maker', description: 'Design presentations', bgColor: 'bg-tool-yellow', emoji: '📺' },
                    ...(expandedSections.designApps ? [
                      { name: 'Business Card Maker', description: 'Design business cards', bgColor: 'bg-tool-blue', emoji: '💳' },
                      { name: 'Brochure Creator', description: 'Create brochures', bgColor: 'bg-tool-yellow', emoji: '📰' },
                      { name: 'Certificate Maker', description: 'Design certificates', bgColor: 'bg-tool-green', emoji: '🏆' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">CONTENT APPS</h2>
                  <button 
                    onClick={() => setExpandedSections({ ...expandedSections, contentApps: !expandedSections.contentApps })}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    See All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {[
                    { name: 'Blog Writer', description: 'Generate blog posts', bgColor: 'bg-tool-green', emoji: '✍️' },
                    { name: 'Social Posts', description: 'Create social content', bgColor: 'bg-tool-blue', emoji: '📱' },
                    { name: 'Email Generator', description: 'Write email campaigns', bgColor: 'bg-tool-yellow', emoji: '📧' },
                    { name: 'Ad Copy Writer', description: 'Generate ad copy', bgColor: 'bg-tool-pink', emoji: '💡' },
                    { name: 'Script Writer', description: 'Create video scripts', bgColor: 'bg-tool-blue', emoji: '🎬' },
                    { name: 'SEO Optimizer', description: 'Optimize for search', bgColor: 'bg-tool-green', emoji: '🔍' },
                    ...(expandedSections.contentApps ? [
                      { name: 'Press Release', description: 'Write press releases', bgColor: 'bg-tool-blue', emoji: '📰' },
                      { name: 'Product Description', description: 'Write product descriptions', bgColor: 'bg-tool-yellow', emoji: '🏷️' },
                      { name: 'Landing Page Copy', description: 'Create landing page copy', bgColor: 'bg-tool-green', emoji: '🎯' },
                    ] : [])
                  ].map((tool, idx) => (
                    <div key={idx} className={`${tool.bgColor} rounded-2xl p-4 hover:scale-105 transition cursor-pointer`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <h3 className="font-bold text-sm mb-1 text-black">{tool.name}</h3>
                      <p className="text-xs text-black">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Apps;
