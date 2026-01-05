import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Play, ArrowRight, Zap, Users, TrendingUp, Clock, Sparkles, Brain, Calendar, BarChart3, MessageSquare, Camera, FileText, Video, Image as ImageIcon } from 'lucide-react';
import vickiRed from '@/assets/vicki-red.png';
import xalinaVoss from '@/assets/xalina-voss.png';
import xalinaProfile from '@/assets/xalina-profile.png';
import keisha from '@/assets/keisha.png';
import AnimatedCounter from '@/components/landing/AnimatedCounter';
import GlowingCard from '@/components/landing/GlowingCard';
import FloatingElement from '@/components/landing/FloatingElement';
import RevvenLogo from '@/components/RevvenLogo';

// Lazy load Three.js for better performance
const ThreeBackground = lazy(() => import('@/components/landing/ThreeBackground'));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0, 0, 0.2, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

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
      name: "Francis",
      role: "The Strategist",
      description: "Crafts offers, builds marketing funnels, and designs campaigns that attract real buyers.",
      color: "from-blue-500 to-cyan-600",
      image: null
    },
    {
      name: "Brian",
      role: "The Architect",
      description: "Builds the automated workflows that scales your business.",
      color: "from-indigo-500 to-purple-600",
      image: null
    },
    {
      name: "Rich",
      role: "The Closer",
      description: "Writes sales scripts and follow-up sequences that turn interest into revenue.",
      color: "from-orange-500 to-amber-600",
      image: null
    },
    {
      name: "Dolmar",
      role: "The Visionary",
      description: "Generates branded visuals, videos, and your AI characters that posts in your voice",
      color: "from-green-500 to-emerald-600",
      image: null
    },
    {
      name: "Keisha",
      role: "The Creator",
      description: "Creates digital products, content, and writes sales copy in minutes.",
      color: "from-pink-500 to-rose-600",
      image: keisha
    },
    {
      name: "Damoi",
      role: "The Operator",
      description: "Manages projects and executes systems with precision and consistency",
      color: "from-teal-500 to-cyan-600",
      image: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Fixed Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <RevvenLogo size={32} />
              <span className="text-xl font-bold tracking-tight">REVVEN</span>
            </motion.div>

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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-6"
                  onClick={() => navigate('/signup')}
                >
                  Start Free
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Three.js Background */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center">
        {/* Three.js Background */}
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />}>
          <ThreeBackground />
        </Suspense>
        
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/70 to-gray-900 z-[1]" />
        
        <motion.div 
          className="max-w-7xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full mb-6"
          >
            <span className="text-green-400 font-medium">CREATE ANYTHING — MONETIZE — AUTOMATE EVERYTHING!</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            While You Sleep, Your AI Team<br />
            Grows & Automates Your{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={activeValueProp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`${valuePros[activeValueProp].color} inline-block`}
              >
                {valuePros[activeValueProp].text}
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-2xl text-gray-400 mb-8 max-w-5xl mx-auto"
          >
            The One AI Revenue Engine That Fully Automates Your Content, Marketing & Sales 24/7
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg group">
                Start Automating Now
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-green-600 text-black bg-white hover:bg-gray-100 px-8 py-6 text-lg">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Content Type Preview Carousel */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-5xl mx-auto"
          >
            {contentTypes.map((type, index) => (
              <motion.div 
                key={index} 
                variants={scaleIn}
                custom={index}
                whileHover={{ scale: 1.08, y: -5 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
                  <FloatingElement delay={index * 0.2} duration={3 + index * 0.5} yOffset={10}>
                    <div className="w-full aspect-[9/16] bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg mb-3 flex items-center justify-center">
                      <type.icon className="w-8 h-8 text-green-500" />
                    </div>
                  </FloatingElement>
                  <h3 className="text-sm font-semibold text-center">{type.name}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-green-500 opacity-60" />
        </motion.div>
      </section>

      {/* Modern Content Experience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30 relative">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-center mb-16"
          >
            Your Fully Automated Revenue Engine
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Features */}
            <motion.div variants={fadeInUp}>
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
                <motion.div 
                  className="flex gap-4"
                  whileHover={{ x: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Smart Cross-Posting That Actually Works →</h3>
                    <p className="text-gray-400">Select your channels, hit publish, and watch your content flood every platform simultaneously. No copy-paste. No reformatting. No manual posting. No time wasted.</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex gap-4"
                  whileHover={{ x: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Platform-Perfect Every Time 🔥 →</h3>
                    <p className="text-gray-400">Your content automatically adapts to each platform&apos;s format, dimensions, and best practices. Instagram Reels? Done. LinkedIn carousel? Done. X&nbsp;threads? Done.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Visual Preview */}
            <GlowingCard className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 border border-gray-700">
              {/* Mockup of social post interface */}
              <motion.div 
                className="bg-white rounded-2xl p-4 mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={xalinaProfile} alt="Xalina Voss" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Xalina Voss</p>
                    <p className="text-gray-500 text-xs">Just now</p>
                  </div>
                </div>
                <p className="text-gray-800 text-sm mb-3">This is your year!</p>
                <div className="w-full aspect-video bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg overflow-hidden">
                  <img src={xalinaVoss} alt="Xalina Voss" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              <div className="grid grid-cols-4 gap-2">
                {['Instagram', 'Facebook', 'X', 'LinkedIn'].map((platform, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-gray-700 rounded-lg p-2 text-center"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <p className="text-xs text-gray-400">{platform}</p>
                  </motion.div>
                ))}
              </div>
            </GlowingCard>
          </div>
        </motion.div>
      </section>

      {/* AI Writing Assistant */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Chat Interface Mockup */}
            <GlowingCard className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 border border-gray-700" glowColor="rgba(34, 197, 94, 0.2)">
              <div className="space-y-4">
                {/* AI Message */}
                <motion.div 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-700 rounded-2xl rounded-tl-sm p-4 flex-1">
                    <p className="text-sm">Hi there 👋</p>
                    <p className="text-sm mt-2">I'm the FeedHive AI Assistant. What can I help you with?</p>
                  </div>
                </motion.div>

                {/* User Message */}
                <motion.div 
                  className="flex gap-3 justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-green-600 rounded-2xl rounded-tr-sm p-4 max-w-xs">
                    <p className="text-sm">Create a post about latest trends in AI and business.</p>
                  </div>
                </motion.div>

                {/* AI Response */}
                <motion.div 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
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
                </motion.div>

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
            </GlowingCard>

            {/* Right - Description */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our AI Writing Assistant Is Here To Help You!
              </h2>

              <p className="text-gray-400 text-lg mb-8">
                Our AI Writing Assistant will help you come up with ideas, improve your content and write more engaging posts.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: MessageSquare, color: 'green', title: 'Built-In AI Agent', desc: 'Chat naturally with your AI writing partner' },
                  { icon: Sparkles, color: 'pink', title: 'Trained For Writing', desc: 'Optimized for social content creation' },
                  { icon: Brain, color: 'blue', title: 'Fine-Tuned AI Model', desc: 'Learns your brand voice over time' },
                  { icon: Zap, color: 'purple', title: 'Based On GPT-5', desc: 'Powered by the latest AI technology' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-start gap-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${item.color}-600/20 flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 30 Days of Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800/30 to-transparent">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Plan and Generate 30 Days of<br />
            Multi-Channel Content With One Click
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-400 mb-8 max-w-4xl mx-auto"
          >
            Just enter your goal or topics, select your channel(s), and REVVEN instantly generates a complete 30-day content campaign with ready-to-review copy for LinkedIn, blogs, social media, and more—tailored specifically to your business.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
                Start Your Free Trial
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-gray-600 hover:bg-gray-800 px-8 py-6 text-lg">
                Watch Our Demos
              </Button>
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup */}
          <GlowingCard className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 border border-gray-700" delay={0.3}>
            <div className="bg-gray-800 rounded-t-2xl p-4 flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <Button className="bg-green-600 hover:bg-green-700">Let's Explore</Button>
            </div>

            <motion.div 
              className="bg-gray-700/30 rounded-xl p-6 mb-6"
              animate={{ 
                boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 30px rgba(34, 197, 94, 0.3)', '0 0 0 rgba(34, 197, 94, 0)']
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-green-500" />
                <p className="text-gray-300">Exciting News! The new REVVEN has launched with a fresh new look and an upgraded experience. Let us take you on a tour!</p>
              </div>
            </motion.div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Hey! What Are We Creating Today? ✨</h3>
              <p className="text-gray-400">Select one channel for 30-days of platform-specific content, or select multiple channels for a coordinated campaign</p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
              {['Instagram', 'YouTube', 'Podcast', 'Email', 'Facebook', 'Blog', 'LinkedIn', 'TikTok'].map((platform, i) => (
                <motion.div 
                  key={i} 
                  className="bg-gray-700 hover:bg-green-600/20 border border-gray-600 hover:border-green-500 rounded-xl p-4 cursor-pointer transition-all"
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-lg mx-auto mb-2" />
                  <p className="text-xs text-center">{platform}</p>
                </motion.div>
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
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button className="bg-green-600 hover:bg-green-700 rounded-full px-6">
                    <Play className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </GlowingCard>
        </motion.div>
      </section>


      {/* 3 Simple Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent" id="how-it-works">
        <motion.div 
          className="max-w-7xl mx-auto text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Fully Automated Revenue Engine
          </h2>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-20">
          {/* Step 1 */}
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={fadeInUp}>
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
            </motion.div>

            <GlowingCard className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 border border-purple-500/30" glowColor="rgba(168, 85, 247, 0.3)">
              {/* Chat interface mockup */}
              <div className="space-y-4">
                <motion.div 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4 flex-1">
                    <p className="text-sm">Who do you want to serve?</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex gap-3 justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-purple-600 rounded-2xl p-4 max-w-xs">
                    <p className="text-sm">Busy Professionals</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4 flex-1">
                    <p className="text-sm">How do you help them?</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex gap-3 justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-purple-600 rounded-2xl p-4 max-w-xs">
                    <p className="text-sm">I Help Weight Loss Without Counting Calories</p>
                  </div>
                </motion.div>
              </div>
            </GlowingCard>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <GlowingCard className="order-2 md:order-1 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-8 border border-green-500/30" glowColor="rgba(34, 197, 94, 0.3)">
              <div className="grid grid-cols-2 gap-4">
                {[FileText, Video, ImageIcon, Camera].map((Icon, i) => (
                  <motion.div 
                    key={i}
                    className="bg-gray-800 rounded-xl p-4 aspect-square flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-8 h-8 text-green-500" />
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex gap-2 flex-wrap">
                {['Hooks & Captions', 'Post Images', 'Looping B-Rolls', 'Talking Reels', 'Text Threads', 'Carousels', 'Lead Magnets & Landing pages'].map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-gray-800 rounded-full px-3 py-1 text-xs flex items-center gap-1"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <Check className="w-3 h-3 text-green-500" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </GlowingCard>

            <motion.div className="order-1 md:order-2" variants={fadeInUp}>
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
            </motion.div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={fadeInUp}>
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
            </motion.div>

            <GlowingCard className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-8 border border-blue-500/30" glowColor="rgba(59, 130, 246, 0.3)">
              <div className="space-y-4">
                <motion.div 
                  className="bg-gray-800 rounded-xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Weekly engagement</span>
                    <span className="text-green-400 text-sm">+14%</span>
                  </div>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter end={4200} suffix="" />
                  </p>
                  <div className="mt-2 h-20 bg-gray-700 rounded-lg overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-800 rounded-xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Followers</span>
                    <span className="text-green-400 text-sm">+8.3%</span>
                  </div>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter end={9008} />
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                    <motion.div 
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '65%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="bg-gray-800 rounded-xl p-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-xs text-gray-400 mb-1">Reach</p>
                    <p className="text-2xl font-bold">
                      <AnimatedCounter end={115537} />
                    </p>
                    <p className="text-xs text-green-400">+20.6%</p>
                  </motion.div>
                  <motion.div 
                    className="bg-gray-800 rounded-xl p-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-xs text-gray-400 mb-1">Impressions</p>
                    <p className="text-2xl font-bold">
                      <AnimatedCounter end={139573} />
                    </p>
                    <p className="text-xs text-green-400">+11.2%</p>
                  </motion.div>
                </div>
              </div>
            </GlowingCard>
          </motion.div>
        </div>
      </section>

      {/* Meet Your Agentic Marketing Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800/30 to-transparent" id="team">
        <motion.div 
          className="max-w-7xl mx-auto text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-4">
            Meet Your AI Team
          </motion.h2>
          <motion.div variants={fadeInUp} className="mt-8 space-y-4">
            <p className="text-xl md:text-2xl font-bold text-green-400 uppercase tracking-wide">
              YOUR UNFAIR ADVANTAGE HAS ARRIVED
            </p>
            <h3 className="text-3xl md:text-4xl font-bold">
              An AI Dream Team That Never Stops. Never Quits.
            </h3>
            <p className="text-2xl md:text-3xl font-semibold text-gray-300">
              Working 24/7. Zero Salaries. Zero Drama. Infinite Scale.
            </p>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
              This is what top-tier entrepreneurs dream about: a complete team of specialists executing flawlessly around the clock. Content creation, strategy, automation, growth, all handled by AI agents that work together 24 hours a day, 7 days a week, handling every role you need to dominate your market.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {aiTeam.map((member, index) => (
            <motion.div 
              key={index} 
              variants={scaleIn}
              custom={index}
              className="group"
            >
              <GlowingCard 
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 border border-gray-700 hover:border-green-500 h-full"
                glowColor="rgba(34, 197, 94, 0.2)"
                delay={index * 0.1}
              >
                <motion.div 
                  className={`w-full aspect-square bg-gradient-to-br ${member.color} rounded-2xl mb-6 flex items-center justify-center overflow-hidden`}
                  whileHover={{ scale: 1.05 }}
                >
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                  )}
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-green-400 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-400">{member.description}</p>
              </GlowingCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 100+ Content Pieces */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-7xl mx-auto text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <AnimatedCounter end={100} suffix="+" /> On-Brand Content Pieces<br />
            Every Week - <span className="relative">
              <span className="relative z-10">Zero Burnout.</span>
              <motion.svg 
                className="absolute -bottom-2 left-0 right-0" 
                viewBox="0 0 300 20" 
                xmlns="http://www.w3.org/2000/svg"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.path 
                  d="M0 10 Q 150 20 300 10" 
                  stroke="#8b5cf6" 
                  strokeWidth="3" 
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.svg>
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Today, Consistency wins. Your AI team delivers a constant stream of fresh, platform-ready content without you touching a keyboard.
          </p>
        </motion.div>

        {/* Content Examples Grid */}
        <motion.div 
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { label: 'Landing Pages', color: 'from-blue-600 to-blue-700' },
            { label: 'Loop Reels', color: 'from-purple-600 to-purple-700' },
            { label: 'Image Post', color: 'from-pink-600 to-pink-700' },
            { label: 'Talking Reels', color: 'from-green-600 to-green-700' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              variants={scaleIn}
              className="group"
            >
              <motion.div 
                className="relative aspect-[9/16] rounded-2xl overflow-hidden mb-3"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  >
                    <Play className="w-12 h-12 text-white/80" />
                  </motion.div>
                </div>
              </motion.div>
              <p className="text-center font-semibold">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Personalization Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-transparent">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Each Agent Is Trained To Know Your Brand
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Your AI agents are hyper-personalized to your brand—voice, face, style, strategy. Every piece of content looks, sounds, and feels like YOU.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Brand Memory */}
            <GlowingCard className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 p-6" glowColor="rgba(168, 85, 247, 0.3)">
              <h3 className="text-xl font-bold mb-4">Brand Memory</h3>
              <p className="text-sm text-gray-300 mb-6">
                Upload your logo, colors, bio & writing samples. Your AI agents remember everything.
              </p>
              <div className="space-y-3">
                {[
                  { icon: ImageIcon, text: 'Brand Logo' },
                  { icon: FileText, text: 'Writing Samples' },
                  { icon: MessageSquare, text: 'Brand Voice' },
                  { icon: FileText, text: 'Bio' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="bg-white/10 rounded-xl p-3 flex items-center gap-3"
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <item.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </GlowingCard>

            {/* Editable Agent Brain */}
            <GlowingCard className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 p-6">
              <h3 className="text-xl font-bold mb-4">Editable Agent Brain</h3>
              <p className="text-sm text-gray-300 mb-6">
                Bring your prompts (BYP), or frameworks. Every agent can be shaped to match your tone, style, and strategy.
              </p>
              <div className="relative">
                <div className="bg-gray-900 rounded-2xl p-4 text-center">
                  <motion.div 
                    className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain className="w-16 h-16 text-white" />
                  </motion.div>
                  <div className="absolute top-2 left-2 bg-gray-800 rounded-lg px-3 py-1 text-xs">System Prompt</div>
                  <div className="absolute top-2 right-2 bg-gray-800 rounded-lg px-3 py-1 text-xs">Writing Style</div>
                  <div className="absolute bottom-2 left-2 bg-gray-800 rounded-lg px-3 py-1 text-xs">Examples</div>
                </div>
              </div>
            </GlowingCard>

            {/* Smart Media Folder */}
            <GlowingCard className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 p-6">
              <h3 className="text-xl font-bold mb-4">Smart Media Folder</h3>
              <p className="text-sm text-gray-300 mb-6">
                AI images or upload your real photos AI auto-selects visuals to match each post for real, authentic content.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[1,2,3,4].map((i) => (
                  <motion.div 
                    key={i} 
                    className="aspect-square bg-gray-900 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                  />
                ))}
              </div>
              <motion.div 
                className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-4 text-center"
                animate={{ 
                  boxShadow: ['0 0 0 rgba(168, 85, 247, 0)', '0 0 20px rgba(168, 85, 247, 0.3)', '0 0 0 rgba(168, 85, 247, 0)']
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-xs">Auto-select mode active</p>
              </motion.div>
            </GlowingCard>

            {/* Consistent Character */}
            <GlowingCard className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 p-6">
              <h3 className="text-xl font-bold mb-4">Consistent Character</h3>
              <p className="text-sm text-gray-300 mb-6">
                Stick with one face yours or a chosen model so every content features the same recognizable character.
              </p>
              <div className="relative">
                <div className="aspect-square bg-gray-900 rounded-2xl p-4 flex items-center justify-center">
                  <motion.div 
                    className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                </div>
                <div className="absolute bottom-4 right-4">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button className="bg-purple-600 hover:bg-purple-700 rounded-full">
                      Generate
                    </Button>
                  </motion.div>
                </div>
              </div>
            </GlowingCard>

            {/* Talking Head Avatars */}
            <GlowingCard className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 p-6" glowColor="rgba(168, 85, 247, 0.3)">
              <h3 className="text-xl font-bold mb-4">Talking Head Avatars</h3>
              <p className="text-sm text-gray-300 mb-6">
                Turn yourself into a digital twin so your AI agents can use to create multilingual talking reels without filming.
              </p>
              <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Play className="w-16 h-16 text-purple-400" />
                </motion.div>
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
            </GlowingCard>

            {/* Photo Avatars */}
            <GlowingCard className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 p-6" glowColor="rgba(168, 85, 247, 0.3)">
              <h3 className="text-xl font-bold mb-4">Photo Avatars</h3>
              <p className="text-sm text-gray-300 mb-6">
                Add a few selfies to train your AI agents to create branded post images and b-roll of you in different styles.
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[1,2,3].map((i) => (
                    <motion.div 
                      key={i} 
                      className="flex-1 aspect-square bg-gray-900 rounded-lg"
                      whileHover={{ scale: 1.1, y: -5 }}
                    />
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    Generate
                  </Button>
                </motion.div>
              </div>
            </GlowingCard>
          </div>
        </motion.div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
            Trusted By <AnimatedCounter end={15000} suffix="+" /> Creators, Marketers, Agencies And Brands
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 mb-8">Join the revolution in AI-powered business automation</motion.p>
          
          {/* Stats */}
          <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 mb-12">
            <motion.div whileHover={{ scale: 1.1 }}>
              <p className="text-4xl font-bold text-green-400 mb-2">
                <AnimatedCounter end={100} suffix="+" />
              </p>
              <p className="text-sm text-gray-400">Content pieces/week</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <p className="text-4xl font-bold text-green-400 mb-2">24/7</p>
              <p className="text-sm text-gray-400">Always working</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <p className="text-4xl font-bold text-green-400 mb-2">$0</p>
              <p className="text-sm text-gray-400">Payroll costs</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </motion.h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="border-b border-gray-800 pb-4"
              >
                <motion.button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left py-4 hover:text-green-500 transition-colors group"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-lg font-medium pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 flex-shrink-0 group-hover:text-green-500" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-900/20 to-transparent relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Let AI Run Your Business While You Sleep?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-400 mb-8">
            Join <AnimatedCounter end={15000} suffix="+" /> business owners who automated their growth with REVVEN
          </motion.p>
          <motion.div variants={fadeInUp}>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button className="bg-green-600 hover:bg-green-700 px-12 py-8 text-xl rounded-full group">
                Start Your Free Trial
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-sm text-gray-500 mt-4">No credit card required • Setup in 5 minutes</motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <motion.div 
                className="flex items-center gap-2.5 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <RevvenLogo size={32} />
                <span className="text-xl font-bold tracking-tight">REVVEN</span>
              </motion.div>
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
                {['Features', 'Pricing', 'AI Agents', 'Use Cases'].map((item) => (
                  <li key={item}>
                    <motion.a 
                      href="#" 
                      className="hover:text-green-500"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {['Documentation', 'Templates', 'Blog', 'Community'].map((item) => (
                  <li key={item}>
                    <motion.a 
                      href="#" 
                      className="hover:text-green-500"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {['About', 'Careers', 'Contact', 'Privacy'].map((item) => (
                  <li key={item}>
                    <motion.a 
                      href="#" 
                      className="hover:text-green-500"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-gray-400 text-sm">
              {['Terms', 'Privacy', 'Cookies'].map((item) => (
                <motion.a 
                  key={item} 
                  href="#" 
                  className="hover:text-green-500"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube'].map((platform) => (
                <motion.div 
                  key={platform} 
                  className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-xs">{platform[0]}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
