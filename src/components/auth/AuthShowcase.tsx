import React, { useState, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';

// Showcase slides data - Logical flow: Content Creation → Social Automation → Business Tools → Scale
export const showcaseSlides = [
  // Core Content Creation
  {
    title: "Idea To Video In Seconds",
    description: "Stop waiting weeks for video content. Type your idea, and watch AI transform it into scroll-stopping videos that captivate your audience instantly.",
    features: ["Text-to-Video", "AI Scripts", "Auto Editing"],
    bgColor: "bg-violet-50",
    accentColor: "text-violet-700",
    pillBg: "bg-violet-200/60",
  },
  {
    title: "AI Image Generation",
    description: "Create stunning visuals that stop thumbs and turn heads. Professional-quality images for ads, posts, and products—generated in seconds.",
    features: ["Photo-Realistic", "Art Styles", "Brand Assets"],
    bgColor: "bg-indigo-50",
    accentColor: "text-indigo-700",
    pillBg: "bg-indigo-200/60",
  },
  {
    title: "AI Music & Audio Studio",
    description: "Compose original soundtracks, jingles, and audio that's 100% yours. No licensing fees. No copyright strikes. Just pure creativity.",
    features: ["Music Generation", "Sound Effects", "Voice Cloning"],
    bgColor: "bg-teal-50",
    accentColor: "text-teal-700",
    pillBg: "bg-teal-200/60",
  },
  {
    title: "Professional Video Editing",
    description: "Hollywood-level editing without the learning curve. AI handles the cuts, transitions, and effects—you just approve the magic.",
    features: ["Smart Cuts", "Auto Captions", "Effects Library"],
    bgColor: "bg-amber-50",
    accentColor: "text-amber-700",
    pillBg: "bg-amber-200/60",
  },
  {
    title: "Product Video Photoshoot",
    description: "Turn any product photo into a stunning video ad. No studio. No crew. No budget. Just upload and let AI create video magic.",
    features: ["Product Ads", "Lifestyle Shots", "Brand Videos"],
    bgColor: "bg-blue-50",
    accentColor: "text-blue-700",
    pillBg: "bg-blue-200/60",
  },
  {
    title: "Your AI Twin Creates For You",
    description: "Train your AI character to create content in your unique brand voice. It learns your style, tone, and personality—then produces videos, posts, and graphics exactly like you would. Scale yourself infinitely.",
    features: ["AI Twin", "Brand Voice Cloning", "Auto Content Creation"],
    bgColor: "bg-fuchsia-50",
    accentColor: "text-fuchsia-700",
    pillBg: "bg-fuchsia-200/60",
  },
  {
    title: "AI Digital Characters",
    description: "Create lifelike AI influencers and spokespersons that work 24/7. Clone your voice, animate photos, and let your AI characters produce content on autopilot.",
    features: ["AI Avatars", "Voice Cloning", "Talking Photos"],
    bgColor: "bg-violet-50",
    accentColor: "text-violet-700",
    pillBg: "bg-violet-200/60",
  },
  {
    title: "Video Translation",
    description: "Reach the world in 90+ languages. AI translates your videos with perfect lip-sync—your content, every language, zero barriers.",
    features: ["90+ Languages", "Lip-Sync", "Voice Matching"],
    bgColor: "bg-lime-50",
    accentColor: "text-lime-700",
    pillBg: "bg-lime-200/60",
  },
  // Social Media Automation Flow
  {
    title: "Automated Social Content",
    description: "30 days of content in 30 seconds. AI auto-creates captions, graphics, and videos in your brand voice. Your content machine runs 24/7 without you.",
    features: ["Auto-Create Content", "AI Copywriting", "Batch Generation"],
    bgColor: "bg-sky-50",
    accentColor: "text-sky-700",
    pillBg: "bg-sky-200/60",
  },
  {
    title: "Auto Scheduling & Posting",
    description: "Set it and forget it. AI schedules your content at peak engagement times and auto-posts across every platform—completely hands-free.",
    features: ["Smart Scheduling", "Auto-Post", "Multi-Platform"],
    bgColor: "bg-rose-50",
    accentColor: "text-rose-700",
    pillBg: "bg-rose-200/60",
  },
  {
    title: "Auto Engagement & Replies",
    description: "Never miss a comment, DM, or story mention again. AI responds instantly in your voice—keeping followers engaged 24/7 while you sleep.",
    features: ["Auto Comments", "DM Responses", "Story Replies"],
    bgColor: "bg-orange-50",
    accentColor: "text-orange-700",
    pillBg: "bg-orange-200/60",
  },
  // Business & Growth Tools
  {
    title: "Create Digital Products",
    description: "Launch eBooks and courses in minutes, not months. AI writes, designs, and packages your expertise into products that sell while you sleep.",
    features: ["eBook Creator", "Course Builder", "Instant Design"],
    bgColor: "bg-emerald-50",
    accentColor: "text-emerald-700",
    pillBg: "bg-emerald-200/60",
  },
  {
    title: "Stunning Websites In Minutes",
    description: "Describe your vision and watch AI build beautiful, responsive websites instantly. Edit with drag-and-drop. Launch in one click.",
    features: ["AI Website Builder", "Drag & Drop", "Instant Publish"],
    bgColor: "bg-teal-50",
    accentColor: "text-teal-700",
    pillBg: "bg-teal-200/60",
  },
  {
    title: "One-Click Funnels",
    description: "Build high-converting sales funnels in seconds. AI designs, writes copy, and optimizes for conversions—no designers or developers needed.",
    features: ["Funnel Builder", "AI Copywriting", "Conversion Optimized"],
    bgColor: "bg-amber-50",
    accentColor: "text-amber-700",
    pillBg: "bg-amber-200/60",
  },
  {
    title: "Automated Lead Generation",
    description: "Find and capture high-quality leads on autopilot. AI identifies your ideal customers, reaches out, and fills your pipeline while you focus on closing.",
    features: ["Smart Targeting", "Auto Outreach", "Lead Scoring"],
    bgColor: "bg-cyan-50",
    accentColor: "text-cyan-700",
    pillBg: "bg-cyan-200/60",
  },
  {
    title: "Custom Business CRM",
    description: "Manage leads, automate follow-ups, and close more deals. Your AI-powered command center for unstoppable business growth.",
    features: ["Lead Tracking", "Auto Follow-ups", "Smart Analytics"],
    bgColor: "bg-slate-100",
    accentColor: "text-slate-700",
    pillBg: "bg-slate-200/60",
  },
  {
    title: "AI-Powered Ad Campaigns",
    description: "Create scroll-stopping ads and launch campaigns across Meta, Google, and TikTok in minutes. AI optimizes your spend and maximizes ROAS automatically.",
    features: ["Ad Creative AI", "Multi-Platform Launch", "Auto-Optimization"],
    bgColor: "bg-red-50",
    accentColor: "text-red-700",
    pillBg: "bg-red-200/60",
  },
  {
    title: "Competitor Intelligence",
    description: "Spy on competitors' ads, emails, social strategies, and websites. Know exactly what's working for them—then do it better.",
    features: ["Ad Spy Tools", "Email Tracking", "Strategy Analysis"],
    bgColor: "bg-slate-50",
    accentColor: "text-slate-700",
    pillBg: "bg-slate-200/60",
  },
  {
    title: "Your Brand, Every Output",
    description: "Every piece of content—videos, images, copy, emails—automatically matches your brand identity, voice, and style guidelines. Perfect consistency at scale.",
    features: ["Brand Voice AI", "Style Matching", "Visual Consistency"],
    bgColor: "bg-fuchsia-50",
    accentColor: "text-fuchsia-700",
    pillBg: "bg-fuchsia-200/60",
  },
  {
    title: "Revenue Dashboard & Analytics",
    description: "Track every dollar, every conversion, every metric in one beautiful dashboard. AI predicts trends and suggests optimizations to maximize profit.",
    features: ["Real-Time Revenue", "AI Predictions", "ROI Tracking"],
    bgColor: "bg-emerald-50",
    accentColor: "text-emerald-700",
    pillBg: "bg-emerald-200/60",
  },
  {
    title: "Build Apps In Minutes",
    description: "No coding required. Describe your dream app and watch AI build it before your eyes. From idea to launch in a single session.",
    features: ["No-Code Builder", "AI Development", "Instant Deploy"],
    bgColor: "bg-indigo-50",
    accentColor: "text-indigo-700",
    pillBg: "bg-indigo-200/60",
  },
  // Scale & Exit
  {
    title: "White-Label Your Empire",
    description: "Rebrand the entire platform as your own and sell to clients. Build a SaaS empire without writing a single line of code. Your brand, your business, your profits.",
    features: ["Custom Branding", "Client Portals", "Recurring Revenue"],
    bgColor: "bg-purple-50",
    accentColor: "text-purple-700",
    pillBg: "bg-purple-200/60",
  },
  {
    title: "And So Much More...",
    description: "Run your entire business on autopilot. Outpace competitors while they're still hiring. This isn't just a tool—it's the unfair advantage they'll never see coming.",
    features: ["Automate Everything", "Outwork Anyone", "Unfair Advantage"],
    bgColor: "bg-gradient-to-br from-brand-green/10 to-emerald-50",
    accentColor: "text-brand-green",
    pillBg: "bg-brand-green/20",
  },
];

export default function AuthShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides (slower: 7 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentSlideData = showcaseSlides[currentSlide];

  return (
    <div className={`hidden lg:flex flex-1 h-full min-h-0 ${currentSlideData.bgColor} p-12 flex-col relative overflow-hidden transition-colors duration-700`}>
      {/* Logo at top left */}
      <div className="flex items-center gap-2.5 mb-8">
        <RevvenLogo size={40} />
        <span className="text-2xl font-bold text-gray-900 tracking-tight">REVVEN</span>
      </div>

      {/* Slide Content - Fixed height container to prevent layout shifts */}
      <div className="max-w-xl relative z-10 h-[400px] flex flex-col justify-center flex-1">
        <div className="mb-8">
          <span className={`inline-block px-4 py-1.5 ${currentSlideData.pillBg} backdrop-blur-sm rounded-full ${currentSlideData.accentColor} text-sm font-medium mb-6`}>
            ✨ Powered By AI
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold ${currentSlideData.accentColor} mb-4 leading-tight transition-all duration-500 min-h-[120px]`}>
            {currentSlideData.title}
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed transition-all duration-500 min-h-[84px]">
            {currentSlideData.description}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 mb-12 min-h-[44px]">
          {currentSlideData.features.map((feature, idx) => (
            <span 
              key={idx}
              className={`px-4 py-2 ${currentSlideData.pillBg} backdrop-blur-sm rounded-full ${currentSlideData.accentColor} text-sm font-medium`}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-12 left-12 right-12 flex items-center z-10">
        <div className="flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {showcaseSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? `w-8 ${currentSlideData.accentColor.replace('text-', 'bg-')}` 
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          {/* Pause/Play button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-full ${currentSlideData.pillBg} ${currentSlideData.accentColor} hover:opacity-80 transition-opacity`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 ${currentSlideData.pillBg} rounded-full blur-3xl opacity-50`} />
        <div className={`absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 ${currentSlideData.pillBg} rounded-full blur-3xl opacity-30`} />
      </div>
    </div>
  );
}
