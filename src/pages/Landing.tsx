import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Play, ArrowRight, Zap, Users, TrendingUp, Clock, Sparkles, Brain, Calendar, BarChart3, MessageSquare, Camera, FileText, Video, Image as ImageIcon } from 'lucide-react';
import vickiRed from '@/assets/vicki-red.png';
import vickiPink from '@/assets/vicki-pink.png';
import xalinaVoss from '@/assets/xalina-voss.png';

export default function RevvenLandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeValueProp, setActiveValueProp] = useState(0);

  const valuePros = [
    { text: "Business", color: "text-purple-400" },
    { text: "Audience", color: "text-green-400" },
    { text: "Leads", color: "text-emerald-400" },
    { text: "Sales", color: "text-lime-400" },
    { text: "Revenue", color: "text-green-500" },
    { text: "Authority", color: "text-teal-400" },
    { text: "Growth", color: "text-cyan-400" },
    { text: "Freedom", color: "text-blue-400" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveValueProp((prev) => (prev + 1) % valuePros.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      question: "What is REVVEN?",
      answer: "REVVEN is the world's first fully autonomous AI marketing team that creates, distributes, and amplifies 100+ pieces of content weekly so you stay visible, trusted, and sell—without hiring, burnout, or manual effort."
    },
    {
      question: "How is REVVEN different from other AI tools?",
      answer: "Unlike single-purpose AI tools, REVVEN provides a complete AI team (6 specialized agents) that work together. It's not just content creation—it's full business automation with strategy, execution, and optimization built in."
    },
    {
      question: "Can I review content before it's published?",
      answer: "Yes! Choose Copilot Mode where AI drafts everything and you review/approve before publishing. Or go Fully Autonomous where AI handles everything 24/7 based on your rules."
    },
    {
      question: "What types of content can REVVEN create?",
      answer: "REVVEN creates everything: social posts, videos, carousels, talking reels, landing pages, digital products, email campaigns, blog articles, sales pages, lead magnets, and more—all in your brand voice."
    },
    {
      question: "Do I need technical skills to use REVVEN?",
      answer: "Not at all! REVVEN is designed for business owners and creators with zero technical background. Just answer a few questions about your business, and your AI team handles the rest."
    },
    {
      question: "How does the Brand Memory work?",
      answer: "Your AI agents learn your brand voice, tone, style, logo, colors, and personality from day one. Every piece of content maintains 100% brand consistency across all platforms automatically."
    },
    {
      question: "Can REVVEN integrate with my existing tools?",
      answer: "Yes! REVVEN connects with Instagram, Facebook, TikTok, X, LinkedIn, YouTube, email platforms, CRMs, and more. Publish, schedule, and track everything from one dashboard."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Start with our free plan to experience your AI team in action. Upgrade anytime to unlock more agents, content volume, and advanced features."
    },
    {
      question: "How long does setup take?",
      answer: "Less than 5 minutes. Answer 3 simple questions about your business, connect your accounts, and your AI team starts creating content immediately."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 chat support, comprehensive documentation, video tutorials, regular strategy sessions with your AI CMO, and access to our community of 15,000+ creators and business owners."
    }
  ];

  const contentTypes = [
    { name: "Talking Reels", icon: Video, description: "AI avatars that speak, emote, and move naturally" },
    { name: "Carousels", icon: ImageIcon, description: "Engaging multi-slide posts for all platforms" },
    { name: "Landing Pages", icon: FileText, description: "High-converting pages built in minutes" },
    { name: "Image Posts", icon: Camera, description: "Stunning visuals with your branding" },
    { name: "Loop Reels", icon: Video, description: "Attention-grabbing short videos" },
    { name: "Lead Magnets", icon: FileText, description: "eBooks, guides, and resources" }
  ];

  const aiTeam = [
    {
      name: "Brian",
      role: "Automation Engineer",
      description: "Builds workflows, integrations, and systems that run your business on autopilot",
      color: "from-indigo-500 to-purple-600"
    },
    {
      name: "Francis",
      role: "Marketing Strategist",
      description: "Builds funnels, creates SEO content, and drives qualified leads to your business",
      color: "from-blue-500 to-cyan-600"
    },
    {
      name: "Rich",
      role: "Sales & Conversion Specialist",
      description: "Writes sales copy, creates landing pages, and converts leads into customers",
      color: "from-orange-500 to-amber-600"
    },
    {
      name: "Dolmar",
      role: "Content Creation Director",
      description: "Creates social posts, videos, carousels, and digital products in your brand voice",
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "Keisha",
      role: "Design & Visual Lead",
      description: "Designs branded visuals, product mockups, and attention-grabbing graphics",
      color: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold">REVVEN</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
            </nav>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-white hover:text-green-500"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/login')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Rotating Value Prop */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full mb-6">
            <span className="text-green-400 font-medium">CREATE ANYTHING — MONETIZE — AUTOMATE EVERYTHING!</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            While You Sleep, Your AI Team<br />
            Grows & Automates Your{' '}
            <span className={`${valuePros[activeValueProp].color} transition-colors duration-500`}>
              {valuePros[activeValueProp].text}
            </span>
          </h1>

          <p className="text-2xl text-gray-400 mb-8 max-w-5xl mx-auto whitespace-nowrap">
            The One AI Revenue Engine That Fully Automates Your Content, Marketing & Sales 24/7
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
              Start Automating Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-green-600 text-black bg-white hover:bg-gray-100 px-8 py-6 text-lg">
              Watch Demo
            </Button>
          </div>

          {/* Content Type Preview Carousel */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {contentTypes.map((type, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:scale-105">
                  <div className="w-full aspect-[9/16] bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg mb-3 flex items-center justify-center">
                    <type.icon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-center">{type.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Content Experience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16">
            Your Fully Automated Revenue Engine
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Features */}
            <div>
              <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full mb-6">
                <span className="text-green-400 font-medium text-sm">MULTIPLY YOUR REACH</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Publish To All Your Socials <span className="text-green-400">With One Click</span>
              </h2>

              <p className="text-gray-400 text-lg mb-4">
                While You Create Once, We Multiply Your Reach Everywhere.
              </p>

              <p className="text-gray-400 text-base mb-8">
                Stop wasting hours reformatting the same content for different platforms. REVVEN&apos;s intelligent cross-posting engine takes your creation and automatically optimizes it for every social channel, so you can focus on what matters: building your empire.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Smart Cross-Posting That Actually Works →</h3>
                    <p className="text-gray-400">Select your channels, hit publish, and watch your content flood every platform simultaneously. No copy-paste. No reformatting. No manual posting. No time wasted.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Platform-Perfect Every Time 🔥 →</h3>
                    <p className="text-gray-400">Your content automatically adapts to each platform&apos;s format, dimensions, and best practices. Instagram Reels? Done. LinkedIn carousel? Done. X&nbsp;threads? Done.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700">
                {/* Mockup of social post interface */}
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={vickiPink} alt="Xalina Voss" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">Xalina Voss</p>
                      <p className="text-gray-500 text-xs">Just now</p>
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm mb-3">This is your year!</p>
                  <div className="w-full aspect-video bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg overflow-hidden">
                    <img src={xalinaVoss} alt="Xalina Voss" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['Instagram', 'Facebook', 'X', 'LinkedIn'].map((platform, i) => (
                    <div key={i} className="bg-gray-700 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">{platform}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Writing Assistant */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Chat Interface Mockup */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700">
                <div className="space-y-4">
                  {/* AI Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-700 rounded-2xl rounded-tl-sm p-4 flex-1">
                      <p className="text-sm">Hi there 👋</p>
                      <p className="text-sm mt-2">I'm the FeedHive AI Assistant. What can I help you with?</p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-green-600 rounded-2xl rounded-tr-sm p-4 max-w-xs">
                      <p className="text-sm">Create a post about latest trends in AI and business.</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-700 rounded-2xl rounded-tl-sm p-4 flex-1">
                      <p className="text-sm font-medium mb-2">Here's a post highlighting the latest trends in AI and business.</p>
                      <div className="bg-gray-800 rounded-lg p-3 text-xs">
                        <p className="text-gray-300">Artificial intelligence is transforming the business landscape...</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">Accept</Button>
                        <Button size="sm" variant="ghost" className="text-xs">Discard</Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-500">
                    Let's include a few bullet points.
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-full">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right - Description */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our AI Writing Assistant Is Here To Help You!
              </h2>

              <p className="text-gray-400 text-lg mb-8">
                Our AI Writing Assistant will help you come up with ideas, improve your content and write more engaging posts.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Built-In AI Agent</h3>
                    <p className="text-sm text-gray-400">Chat naturally with your AI writing partner</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trained For Writing</h3>
                    <p className="text-sm text-gray-400">Optimized for social content creation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fine-Tuned AI Model</h3>
                    <p className="text-sm text-gray-400">Learns your brand voice over time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Based On GPT-5</h3>
                    <p className="text-sm text-gray-400">Powered by the latest AI technology</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 30 Days of Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800/30 to-transparent">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Plan and Generate 30 Days of<br />
            Multi-Channel Content With One Click
          </h2>

          <p className="text-xl text-gray-400 mb-8 max-w-4xl mx-auto">
            Just enter your goal or topics, select your channel(s), and REVVEN instantly generates a complete 30-day content campaign with ready-to-review copy for LinkedIn, blogs, social media, and more—tailored specifically to your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
              Start Your Free Trial
            </Button>
            <Button variant="outline" className="border-gray-600 hover:bg-gray-800 px-8 py-6 text-lg">
              Watch Our Demos
            </Button>
          </div>

          {/* Dashboard Mockup */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700">
            <div className="bg-gray-800 rounded-t-2xl p-4 flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <Button className="bg-green-600 hover:bg-green-700">Let's Explore</Button>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-green-500" />
                <p className="text-gray-300">Exciting News! The new REVVEN has launched with a fresh new look and an upgraded experience. Let us take you on a tour!</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Hey! What Are We Creating Today? ✨</h3>
              <p className="text-gray-400">Select one channel for 30-days of platform-specific content, or select multiple channels for a coordinated campaign</p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
              {['Instagram', 'YouTube', 'Podcast', 'Email', 'Facebook', 'Blog', 'LinkedIn', 'TikTok'].map((platform, i) => (
                <div key={i} className="bg-gray-700 hover:bg-green-600/20 border border-gray-600 hover:border-green-500 rounded-xl p-4 cursor-pointer transition-all">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg mx-auto mb-2" />
                  <p className="text-xs text-center">{platform}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Help me plan a high impact campaign that highlights our productivity app, FocusFlow's new feature designed to help busy professionals optimize their time.</p>
              <div className="flex items-center justify-between">
                <select className="bg-gray-600 rounded-lg px-4 py-2 text-sm">
                  <option>Engagement</option>
                </select>
                <select className="bg-gray-600 rounded-lg px-4 py-2 text-sm">
                  <option>Choose brand</option>
                </select>
                <Button className="bg-green-600 hover:bg-green-700 rounded-full px-6">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 3 Simple Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent" id="how-it-works">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Fully Automated Revenue Engine
          </h2>
        </div>

        <div className="max-w-7xl mx-auto space-y-20">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full mb-6">
                <span className="text-purple-400 font-medium">FIRST</span>
              </div>

              <h3 className="text-4xl font-bold mb-6">Setup Your Growth Engine</h3>

              <p className="text-gray-400 text-lg mb-6">
                You tell Agentic AI who you are, what you sell, and who you serve. AI does deep research & plans your growth engine.
              </p>

              <p className="text-gray-400 text-lg mb-6">
                Connect your social accounts & choose and how many times you want to show up daily. <span className="italic">It takes less than 5 minutes to set up.</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl p-8 border border-purple-500/30">
              {/* Chat interface mockup */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4 flex-1">
                    <p className="text-sm">Who do you want to serve?</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-purple-600 rounded-2xl p-4 max-w-xs">
                    <p className="text-sm">Busy Professionals</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4 flex-1">
                    <p className="text-sm">How do you help them?</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-purple-600 rounded-2xl p-4 max-w-xs">
                    <p className="text-sm">I Help Weight Loss Without Counting Calories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-3xl p-8 border border-green-500/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 aspect-square flex items-center justify-center">
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 aspect-square flex items-center justify-center">
                    <Video className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 aspect-square flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 aspect-square flex items-center justify-center">
                    <Camera className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="mt-6 flex gap-2 flex-wrap">
                  {['Hooks & Captions', 'Post Images', 'Looping B-Rolls', 'Talking Reels', 'Text Threads', 'Carousels', 'Lead Magnets & Landing pages'].map((item, i) => (
                    <div key={i} className="bg-gray-800 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full mb-6">
                <span className="text-green-400 font-medium">NEXT</span>
              </div>

              <h3 className="text-4xl font-bold mb-6">
                Content Creation AI Builds Months Of Content & Lead Magnets
              </h3>

              <p className="text-gray-400 text-lg mb-6">
                Your AI team writes, designs, and edits everything your brand needs to stay visible and drive leads.
              </p>

              <p className="text-gray-400 text-lg">
                <span className="text-white font-semibold">100+ new content created every week</span> till you turn it off.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-6">
                <span className="text-blue-400 font-medium">THEN</span>
              </div>

              <h3 className="text-4xl font-bold mb-6">
                Automated Publishing + Growth
              </h3>

              <p className="text-gray-400 text-lg mb-6">
                Your AI team <span className="text-white font-semibold">posts daily across</span> multiple platforms: Facebook, Instagram, TikTok, X, LinkedIn, etc.
              </p>

              <p className="text-gray-400 text-lg">
                <span className="text-white font-semibold">Auto reply to comments & DMs</span> with auto delivery of your lead magnets on facebook & instagram.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-3xl p-8 border border-blue-500/30">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Weekly engagement</span>
                    <span className="text-green-400 text-sm">+14%</span>
                  </div>
                  <p className="text-3xl font-bold">4,200</p>
                  <div className="mt-2 h-20 bg-gray-700 rounded-lg" />
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Followers</span>
                    <span className="text-green-400 text-sm">+8.3%</span>
                  </div>
                  <p className="text-3xl font-bold">9,008</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Reach</p>
                    <p className="text-2xl font-bold">115,537</p>
                    <p className="text-xs text-green-400">+20.6%</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Impressions</p>
                    <p className="text-2xl font-bold">139,573</p>
                    <p className="text-xs text-green-400">+11.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Agentic Marketing Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800/30 to-transparent" id="team">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Meet Your AI Team
          </h2>
          <p className="text-xl text-gray-400">
            That work 24/7... Without the Payroll
          </p>
          <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
            Every role you'd need to grow your brand daily - now handled by AI agents that work together like a seasoned team.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiTeam.map((member, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:scale-105">
                <div className={`w-full aspect-square bg-gradient-to-br ${member.color} rounded-2xl mb-6 flex items-center justify-center`}>
                  {/* Placeholder for agent avatar - you can replace with actual images */}
                  <div className="w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-green-400 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-400">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 100+ Content Pieces */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            100+ On-Brand Content Pieces<br />
            Every Week - <span className="relative">
              <span className="relative z-10">Zero Burnout.</span>
              <svg className="absolute -bottom-2 left-0 right-0" viewBox="0 0 300 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10 Q 150 20 300 10" stroke="#8b5cf6" strokeWidth="3" fill="none"/>
              </svg>
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Today, Consistency wins. Your AI team delivers a constant stream of fresh, platform-ready content without you touching a keyboard.
          </p>
        </div>

        {/* Content Examples Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Landing Pages', color: 'from-blue-600 to-blue-700' },
            { label: 'Loop Reels', color: 'from-purple-600 to-purple-700' },
            { label: 'Image Post', color: 'from-pink-600 to-pink-700' },
            { label: 'Talking Reels', color: 'from-green-600 to-green-700' },
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden mb-3">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <Play className="w-12 h-12 text-white opacity-80" />
                </div>
              </div>
              <p className="text-sm font-semibold text-center bg-purple-600/20 border border-purple-500/30 rounded-full py-2">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized Content at Scale */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Personalized Content At Scale
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Generic AI content gets ignored. That's why REVVEN trains your AI team on your brand's memory, tone, and personality from day one.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Memory & Voice */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">Brand Memory & Voice</h3>
            <p className="text-sm text-gray-300 mb-6">
              Set your brand voice, brand style, knowledgebase, & bio, logo, to keep agents 100% on-brand across every asset.
            </p>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Brand Logo</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Writing Samples</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Brand Voice</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Bio</span>
              </div>
            </div>
          </div>

          {/* Editable Agent Brain */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">Editable Agent Brain</h3>
            <p className="text-sm text-gray-300 mb-6">
              Bring your prompts (BYP), or frameworks. Every agent can be shaped to match your tone, style, and strategy.
            </p>
            <div className="relative">
              <div className="bg-gray-900 rounded-2xl p-4 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-16 h-16 text-white" />
                </div>
                <div className="absolute top-2 left-2 bg-gray-800 rounded-lg px-3 py-1 text-xs">System Prompt</div>
                <div className="absolute top-2 right-2 bg-gray-800 rounded-lg px-3 py-1 text-xs">Writing Style</div>
                <div className="absolute bottom-2 left-2 bg-gray-800 rounded-lg px-3 py-1 text-xs">Examples</div>
              </div>
            </div>
          </div>

          {/* Smart Media Folder */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">Smart Media Folder</h3>
            <p className="text-sm text-gray-300 mb-6">
              AI images or upload your real photos AI auto-selects visuals to match each post for real, authentic content.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="aspect-square bg-gray-900 rounded-lg" />
              ))}
            </div>
            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-4 text-center">
              <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs">Auto-select mode active</p>
            </div>
          </div>

          {/* Consistent Character */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">Consistent Character</h3>
            <p className="text-sm text-gray-300 mb-6">
              Stick with one face yours or a chosen model so every content features the same recognizable character.
            </p>
            <div className="relative">
              <div className="aspect-square bg-gray-900 rounded-2xl p-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full" />
              </div>
              <div className="absolute bottom-4 right-4">
                <Button className="bg-purple-600 hover:bg-purple-700 rounded-full">
                  Generate
                </Button>
              </div>
            </div>
          </div>

          {/* Talking Head Avatars */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">Talking Head Avatars</h3>
            <p className="text-sm text-gray-300 mb-6">
              Turn yourself into a digital twin so your AI agents can use to create multilingual talking reels without filming.
            </p>
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
              <Play className="w-16 h-16 text-purple-400" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">Your AI Avatar</p>
                    <p className="text-xs text-gray-400">Ready to create</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Avatars */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">Photo Avatars</h3>
            <p className="text-sm text-gray-300 mb-6">
              Add a few selfies to train your AI agents to create branded post images and b-roll of you in different styles.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex-1 aspect-square bg-gray-900 rounded-lg" />
                ))}
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Copilot vs Fully Autonomous */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Use As A Copilot Or Go Fully Autonomous
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Copilot Mode */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Copilot Mode</h3>
            <p className="text-gray-300 mb-6">
              Vibe mode where AI drafts everything, you review and approve before publishing.
            </p>
          </div>

          {/* Fully Autonomous Mode */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Fully Autonomous Mode</h3>
            <p className="text-gray-300 mb-6">
              AI plans, creates, and publishes daily with no manual input. You set the rules, it follows them.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl text-gray-400 mb-8">
            Whichever mode you choose, the result is the same:<br />
            <span className="text-white font-semibold">your brand shows up every day without the grind.</span>
          </p>
          <Button className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
            Start Automating Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted By 15,000+ Creators, Marketers, Agencies And Brands
          </h2>
          <p className="text-gray-400 mb-8">Join the revolution in AI-powered business automation</p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div>
              <p className="text-4xl font-bold text-green-400 mb-2">100+</p>
              <p className="text-sm text-gray-400">Content pieces/week</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400 mb-2">24/7</p>
              <p className="text-sm text-gray-400">Always working</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400 mb-2">$0</p>
              <p className="text-sm text-gray-400">Payroll costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border-b border-gray-800 pb-4"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left py-4 hover:text-green-500 transition-colors group"
                >
                  <span className="text-lg font-medium pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:text-green-500 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="pb-4 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-900/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Let AI Run Your Business While You Sleep?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join 15,000+ business owners who automated their growth with REVVEN
          </p>
          <Button className="bg-green-600 hover:bg-green-700 px-12 py-8 text-xl rounded-full">
            Start Your Free Trial
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Setup in 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-bold">REVVEN</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your 24/7 AI Engine For Content, Connection & Growth
              </p>
              <p className="text-gray-500 text-xs">
                © 2024 REVVEN. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-green-500">Features</a></li>
                <li><a href="#" className="hover:text-green-500">Pricing</a></li>
                <li><a href="#" className="hover:text-green-500">AI Agents</a></li>
                <li><a href="#" className="hover:text-green-500">Use Cases</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-500">Documentation</a></li>
                <li><a href="#" className="hover:text-green-500">Templates</a></li>
                <li><a href="#" className="hover:text-green-500">Blog</a></li>
                <li><a href="#" className="hover:text-green-500">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-500">About</a></li>
                <li><a href="#" className="hover:text-green-500">Careers</a></li>
                <li><a href="#" className="hover:text-green-500">Contact</a></li>
                <li><a href="#" className="hover:text-green-500">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-green-500">Terms</a>
              <a href="#" className="hover:text-green-500">Privacy</a>
              <a href="#" className="hover:text-green-500">Cookies</a>
            </div>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube'].map((platform) => (
                <div key={platform} className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-xs">{platform[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
