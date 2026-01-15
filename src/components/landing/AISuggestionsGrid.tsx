import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Image, FileText, Sparkles, Music, Mic, Search, BarChart3, Lightbulb, Calendar, Zap, Target, TrendingUp, Users, Mail, Bot, RefreshCw, Briefcase, Plane, Building2, GraduationCap, Heart, ShoppingCart, Home, Wallet, Globe, Rocket, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconTooltip } from '@/components/ui/IconTooltip';

export interface Suggestion {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  prompt: string;
  mode?: string; // e.g., 'video', 'image', 'audio', 'content'
  subType?: string; // e.g., 'story', 'generate', 'music'
  model?: string; // e.g., 'kling', 'flux', 'suno'
}

interface IntentSuggestions {
  [key: string]: Suggestion[][];
}

const suggestionsByIntent: IntentSuggestions = {
  Create: [
    [
      { id: 'video', icon: Video, iconColor: 'text-blue-500', title: 'AI Video', description: 'Stunning visuals in seconds.', prompt: 'Create a cinematic 30-second video showcasing a luxury product with dramatic lighting and smooth camera movements', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'calendar', icon: Calendar, iconColor: 'text-emerald-500', title: 'Content Calendar', description: '30 days of content, planned.', prompt: 'Generate a 30-day content calendar for my brand with daily posts across all platforms', mode: 'content', subType: 'calendar' },
      { id: 'image', icon: Image, iconColor: 'text-violet-500', title: 'AI Images', description: 'Visuals that captivate.', prompt: 'Create a photorealistic product image with professional studio lighting and modern aesthetic', mode: 'image', subType: 'generate', model: 'flux' },
      { id: 'music', icon: Music, iconColor: 'text-pink-500', title: 'Custom Music', description: 'Sounds that move souls.', prompt: 'Compose an uplifting background track for a brand video, 60 seconds, modern and inspiring', mode: 'audio', subType: 'music', model: 'suno' },
      { id: 'voice', icon: Mic, iconColor: 'text-emerald-500', title: 'Voice Clone', description: 'Your voice, everywhere.', prompt: 'Clone my voice for creating professional voiceovers for my content', mode: 'audio', subType: 'clone', model: 'elevenlabs' },
      { id: 'blog', icon: FileText, iconColor: 'text-indigo-500', title: 'Blog Article', description: 'Words that convert.', prompt: 'Write a 1500-word SEO-optimized blog post about sustainable living tips', mode: 'document', subType: 'ebook' },
    ],
    [
      { id: 'shorts', icon: Zap, iconColor: 'text-orange-500', title: 'Viral Shorts', description: 'Hook them in 3 seconds.', prompt: 'Create a viral TikTok-style short video with trending transitions and effects', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'podcast', icon: Mic, iconColor: 'text-purple-500', title: 'Podcast Episode', description: 'Stories worth sharing.', prompt: 'Write a podcast episode script about building a personal brand', mode: 'video', subType: 'podcast' },
      { id: 'thumbnail', icon: Image, iconColor: 'text-red-500', title: 'Thumbnails', description: 'Clicks start here.', prompt: 'Design click-worthy YouTube thumbnails for my video content', mode: 'design', subType: 'thumbnail' },
      { id: 'jingle', icon: Music, iconColor: 'text-teal-500', title: 'Brand Jingle', description: 'Sounds they remember.', prompt: 'Create a catchy 5-second audio logo for my brand', mode: 'audio', subType: 'music', model: 'suno' },
      { id: 'newsletter', icon: Mail, iconColor: 'text-blue-600', title: 'Newsletter', description: 'Inbox gold.', prompt: 'Write an engaging weekly newsletter for my audience', mode: 'document', subType: 'ebook' },
      { id: 'script', icon: FileText, iconColor: 'text-slate-600', title: 'Video Script', description: 'Words that sell.', prompt: 'Write a compelling video script for a product launch', mode: 'document', subType: 'ebook' },
    ],
    [
      { id: 'carousel', icon: Image, iconColor: 'text-cyan-500', title: 'Carousel Posts', description: 'Swipe-worthy stories.', prompt: 'Create a 10-slide Instagram carousel about productivity tips with engaging visuals', mode: 'image', subType: 'batch', model: 'flux' },
      { id: 'explainer', icon: Video, iconColor: 'text-rose-500', title: 'Explainer Video', description: 'Complex made simple.', prompt: 'Create a 60-second animated explainer video about how our service works', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'meme', icon: Sparkles, iconColor: 'text-yellow-500', title: 'Meme Content', description: 'Humor that connects.', prompt: 'Generate relatable memes for my niche audience that drive engagement', mode: 'image', subType: 'generate', model: 'flux' },
      { id: 'ebook', icon: FileText, iconColor: 'text-emerald-600', title: 'Ebook', description: 'Authority in pages.', prompt: 'Write a comprehensive 20-page ebook about starting an online business', mode: 'document', subType: 'ebook' },
      { id: 'testimonial', icon: Users, iconColor: 'text-blue-400', title: 'Testimonial Video', description: 'Trust through stories.', prompt: 'Create a customer testimonial video template with professional styling', mode: 'video', subType: 'ugc', model: 'kling' },
      { id: 'infographic', icon: BarChart3, iconColor: 'text-violet-600', title: 'Infographics', description: 'Data made beautiful.', prompt: 'Design an infographic showcasing industry statistics and trends', mode: 'design', subType: 'infographic' },
    ],
    [
      { id: 'reels', icon: Video, iconColor: 'text-pink-600', title: 'Instagram Reels', description: 'Trending format mastery.', prompt: 'Create 5 Instagram Reel concepts with hooks, scripts, and trending audio suggestions', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'linkedin', icon: FileText, iconColor: 'text-blue-700', title: 'LinkedIn Posts', description: 'Professional presence.', prompt: 'Write 7 thought leadership LinkedIn posts that establish authority in my field', mode: 'content', subType: 'social' },
      { id: 'quotes', icon: Sparkles, iconColor: 'text-amber-600', title: 'Quote Graphics', description: 'Wisdom visualized.', prompt: 'Create 10 inspirational quote graphics with modern typography and backgrounds', mode: 'image', subType: 'generate', model: 'flux' },
      { id: 'webinar', icon: Video, iconColor: 'text-indigo-600', title: 'Webinar Content', description: 'Educate and convert.', prompt: 'Create a complete webinar presentation with slides and speaker notes', mode: 'document', subType: 'presentation' },
      { id: 'soundscape', icon: Music, iconColor: 'text-green-500', title: 'Ambient Audio', description: 'Atmosphere on demand.', prompt: 'Create relaxing ambient soundscape for meditation or focus content', mode: 'audio', subType: 'music', model: 'suno' },
      { id: 'case-study', icon: FileText, iconColor: 'text-orange-600', title: 'Case Study', description: 'Results that prove.', prompt: 'Write a detailed case study showcasing client success with data and testimonials', mode: 'document', subType: 'case-study' },
    ],
    [
      { id: 'animation', icon: Video, iconColor: 'text-purple-600', title: 'Motion Graphics', description: 'Animate your brand.', prompt: 'Create animated motion graphics for social media ads with brand elements', mode: 'video', subType: 'animate', model: 'runway' },
      { id: 'whitepaper', icon: FileText, iconColor: 'text-slate-700', title: 'Whitepaper', description: 'Deep expertise shown.', prompt: 'Write a comprehensive whitepaper on industry trends and insights', mode: 'document', subType: 'whitepaper' },
      { id: 'ugc', icon: Users, iconColor: 'text-rose-500', title: 'UGC Scripts', description: 'Authentic content.', prompt: 'Create 5 user-generated content scripts for influencer partnerships', mode: 'video', subType: 'ugc', model: 'kling' },
      { id: 'ad-creative', icon: Image, iconColor: 'text-blue-500', title: 'Ad Creatives', description: 'Ads that convert.', prompt: 'Design high-converting ad creatives for Facebook and Instagram campaigns', mode: 'image', subType: 'generate', model: 'flux' },
      { id: 'pitch-deck', icon: FileText, iconColor: 'text-violet-500', title: 'Pitch Deck', description: 'Win investors over.', prompt: 'Create a compelling 15-slide pitch deck for my startup', mode: 'document', subType: 'presentation' },
      { id: 'soundbites', icon: Mic, iconColor: 'text-emerald-500', title: 'Sound Bites', description: 'Quotable moments.', prompt: 'Create catchy audio soundbites for social media and podcast clips', mode: 'audio', subType: 'sound-effects', model: 'elevenlabs' },
    ],
    [
      { id: 'twitter-thread', icon: FileText, iconColor: 'text-sky-500', title: 'Twitter Threads', description: 'Viral wisdom.', prompt: 'Write a 15-tweet thread breaking down a complex topic in my niche', mode: 'content', subType: 'social' },
      { id: 'product-video', icon: Video, iconColor: 'text-amber-500', title: 'Product Demo', description: 'Features in action.', prompt: 'Create a product demonstration video highlighting key features and benefits', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'brand-kit', icon: Sparkles, iconColor: 'text-pink-500', title: 'Brand Kit', description: 'Visual identity.', prompt: 'Design a complete brand kit with logos, colors, and typography guidelines', mode: 'design', subType: 'logo' },
      { id: 'course-content', icon: FileText, iconColor: 'text-indigo-500', title: 'Course Content', description: 'Teach and earn.', prompt: 'Create a 10-module online course outline with lesson plans', mode: 'document', subType: 'ebook' },
      { id: 'audio-ad', icon: Music, iconColor: 'text-red-500', title: 'Audio Ads', description: 'Ears that convert.', prompt: 'Create a 30-second audio advertisement for podcast sponsorship', mode: 'audio', subType: 'voiceover', model: 'elevenlabs' },
      { id: 'social-stories', icon: Image, iconColor: 'text-teal-500', title: 'Story Templates', description: 'Daily engagement.', prompt: 'Design 10 Instagram Story templates for daily content', mode: 'design', subType: 'poster' },
    ],
    [
      { id: 'bts-content', icon: Video, iconColor: 'text-orange-500', title: 'Behind The Scenes', description: 'Show the journey.', prompt: 'Create behind-the-scenes content strategy for authentic brand storytelling', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'email-templates', icon: Mail, iconColor: 'text-blue-600', title: 'Email Templates', description: 'Inbox excellence.', prompt: 'Design 10 professional email templates for different marketing purposes', mode: 'design', subType: 'invitation' },
      { id: 'sticker-pack', icon: Sparkles, iconColor: 'text-yellow-500', title: 'Sticker Pack', description: 'Fun interactions.', prompt: 'Create a branded sticker pack for social media and messaging apps', mode: 'image', subType: 'generate', model: 'flux' },
      { id: 'product-photos', icon: Image, iconColor: 'text-violet-500', title: 'Product Photos', description: 'Catalog ready.', prompt: 'Generate professional product photography for e-commerce listings', mode: 'image', subType: 'photoshoot', model: 'flux' },
      { id: 'intro-outro', icon: Video, iconColor: 'text-cyan-500', title: 'Intro & Outro', description: 'Professional polish.', prompt: 'Create branded video intro and outro animations for YouTube content', mode: 'video', subType: 'animate', model: 'runway' },
      { id: 'hooks', icon: FileText, iconColor: 'text-rose-500', title: 'Content Hooks', description: 'Stop the scroll.', prompt: 'Write 50 attention-grabbing hooks for social media content', mode: 'content', subType: 'social' },
    ],
    [
      { id: 'comparison', icon: BarChart3, iconColor: 'text-green-500', title: 'Comparison Content', description: 'Help them decide.', prompt: 'Create comparison content showing your product vs competitors', mode: 'design', subType: 'infographic' },
      { id: 'tutorial', icon: Video, iconColor: 'text-purple-500', title: 'Tutorial Video', description: 'Teach with value.', prompt: 'Create a step-by-step tutorial video teaching a skill in my niche', mode: 'video', subType: 'story', model: 'kling' },
      { id: 'announcement', icon: Sparkles, iconColor: 'text-amber-500', title: 'Announcement Post', description: 'News that excites.', prompt: 'Create an exciting product or feature announcement for social media', mode: 'content', subType: 'social' },
      { id: 'press-release', icon: FileText, iconColor: 'text-slate-600', title: 'Press Release', description: 'Media-ready news.', prompt: 'Write a professional press release for an upcoming launch or announcement', mode: 'document', subType: 'report' },
      { id: 'asmr', icon: Music, iconColor: 'text-pink-500', title: 'ASMR Content', description: 'Sensory experience.', prompt: 'Create ASMR-style audio content for relaxation and engagement', mode: 'audio', subType: 'sound-effects', model: 'elevenlabs' },
      { id: 'gif-pack', icon: Image, iconColor: 'text-teal-500', title: 'GIF Collection', description: 'Reactions ready.', prompt: 'Create a branded GIF collection for social media and messaging', mode: 'image', subType: 'generate', model: 'flux' },
    ],
  ],
  Research: [
    [
      { id: 'market', icon: Search, iconColor: 'text-blue-500', title: 'Market Analysis', description: 'Know your battlefield.', prompt: 'Analyze the current market trends and competitive landscape for the wellness industry' },
      { id: 'trends', icon: TrendingUp, iconColor: 'text-emerald-500', title: 'Trend Finder', description: "Spot what's next.", prompt: 'Identify emerging trends in social media marketing for 2026' },
      { id: 'competitor', icon: Target, iconColor: 'text-red-500', title: 'Competitor Intel', description: 'Learn their secrets.', prompt: 'Research top 5 competitors in my niche and analyze their content strategies' },
      { id: 'audience', icon: Users, iconColor: 'text-violet-500', title: 'Audience Insights', description: 'Understand their desires.', prompt: 'Create detailed buyer personas for a luxury skincare brand' },
      { id: 'report', icon: BarChart3, iconColor: 'text-amber-500', title: 'Industry Report', description: 'Data that decides.', prompt: 'Generate a comprehensive industry report on the creator economy' },
      { id: 'gaps', icon: Lightbulb, iconColor: 'text-cyan-500', title: 'Content Gaps', description: 'Find the whitespace.', prompt: 'Identify untapped content opportunities in the fitness coaching space' },
    ],
    [
      { id: 'keywords', icon: Search, iconColor: 'text-green-500', title: 'Keyword Research', description: 'Words that rank.', prompt: 'Find high-volume low-competition keywords for my niche' },
      { id: 'sentiment', icon: Users, iconColor: 'text-pink-500', title: 'Sentiment Analysis', description: 'Feel the pulse.', prompt: 'Analyze customer sentiment from reviews and social mentions' },
      { id: 'pricing', icon: BarChart3, iconColor: 'text-indigo-500', title: 'Price Analysis', description: 'Find the sweet spot.', prompt: 'Research competitor pricing strategies and optimal price points' },
      { id: 'influencer', icon: Sparkles, iconColor: 'text-amber-500', title: 'Influencer Scout', description: 'Find your champions.', prompt: 'Identify top influencers in my niche for potential partnerships' },
      { id: 'benchmark', icon: Target, iconColor: 'text-blue-600', title: 'Benchmarking', description: 'Measure to master.', prompt: 'Create industry benchmarks for engagement and conversion rates' },
      { id: 'swot', icon: Lightbulb, iconColor: 'text-orange-500', title: 'SWOT Analysis', description: 'Know thyself.', prompt: 'Conduct a comprehensive SWOT analysis for my business' },
    ],
    [
      { id: 'hashtag', icon: Search, iconColor: 'text-purple-500', title: 'Hashtag Research', description: 'Tags that trend.', prompt: 'Research the best performing hashtags for my niche on Instagram and TikTok' },
      { id: 'demographics', icon: Users, iconColor: 'text-teal-500', title: 'Demographics Study', description: 'Know your people.', prompt: 'Analyze demographic data and behavior patterns for my target market' },
      { id: 'viral', icon: TrendingUp, iconColor: 'text-rose-500', title: 'Viral Content Study', description: 'Decode virality.', prompt: 'Analyze what makes content go viral in my industry and extract patterns' },
      { id: 'tech-trends', icon: Zap, iconColor: 'text-cyan-600', title: 'Tech Trends', description: 'Future-proof your brand.', prompt: 'Research emerging technologies that will impact my industry in the next 2 years' },
      { id: 'pain-points', icon: Target, iconColor: 'text-red-600', title: 'Pain Point Analysis', description: 'Solve real problems.', prompt: 'Identify the top pain points and frustrations of my target audience' },
      { id: 'content-perf', icon: BarChart3, iconColor: 'text-blue-500', title: 'Content Performance', description: 'Learn from data.', prompt: 'Analyze my best performing content and identify success patterns' },
    ],
    [
      { id: 'seasonal', icon: Calendar, iconColor: 'text-orange-500', title: 'Seasonal Trends', description: 'Timing is everything.', prompt: 'Research seasonal trends and peak engagement periods for my industry' },
      { id: 'platform', icon: Search, iconColor: 'text-violet-600', title: 'Platform Analysis', description: 'Where to focus.', prompt: 'Analyze which social platforms perform best for my type of content' },
      { id: 'usp', icon: Lightbulb, iconColor: 'text-yellow-500', title: 'USP Discovery', description: 'What sets you apart.', prompt: 'Research and identify unique selling propositions that differentiate my brand' },
      { id: 'customer-journey', icon: Users, iconColor: 'text-emerald-600', title: 'Journey Mapping', description: 'Walk their path.', prompt: 'Map the complete customer journey from awareness to advocacy' },
      { id: 'brand-perception', icon: Sparkles, iconColor: 'text-pink-600', title: 'Brand Perception', description: 'How they see you.', prompt: 'Research how my brand is perceived compared to competitors' },
      { id: 'roi-analysis', icon: BarChart3, iconColor: 'text-green-600', title: 'ROI Analysis', description: 'Measure what matters.', prompt: 'Analyze ROI metrics across different marketing channels and campaigns' },
    ],
    [
      { id: 'competitor-content', icon: Search, iconColor: 'text-blue-500', title: 'Content Audit', description: 'Learn from leaders.', prompt: 'Conduct a content audit of top competitors to identify winning formats' },
      { id: 'market-size', icon: BarChart3, iconColor: 'text-violet-500', title: 'Market Sizing', description: 'Know your opportunity.', prompt: 'Research and estimate the total addressable market for my product' },
      { id: 'user-behavior', icon: Users, iconColor: 'text-emerald-500', title: 'User Behavior', description: 'Watch and learn.', prompt: 'Analyze user behavior patterns and preferences on my platform' },
      { id: 'trend-forecast', icon: TrendingUp, iconColor: 'text-amber-500', title: 'Trend Forecasting', description: 'Predict the future.', prompt: 'Forecast upcoming trends in my industry for the next 12 months' },
      { id: 'ad-research', icon: Target, iconColor: 'text-red-500', title: 'Ad Research', description: 'Spy on success.', prompt: 'Research successful ad campaigns from competitors and identify patterns' },
      { id: 'voice-of-customer', icon: Mic, iconColor: 'text-pink-500', title: 'Voice of Customer', description: 'Hear their words.', prompt: 'Analyze customer reviews and feedback to understand their language' },
    ],
    [
      { id: 'feature-gap', icon: Lightbulb, iconColor: 'text-cyan-500', title: 'Feature Gap Analysis', description: 'What they lack.', prompt: 'Identify feature gaps in competitor products that I can capitalize on' },
      { id: 'pricing-psychology', icon: BarChart3, iconColor: 'text-indigo-500', title: 'Pricing Psychology', description: 'Mind over money.', prompt: 'Research pricing psychology tactics used in my industry' },
      { id: 'social-proof', icon: Users, iconColor: 'text-teal-500', title: 'Social Proof Study', description: 'Trust indicators.', prompt: 'Analyze what types of social proof work best in my market' },
      { id: 'channel-analysis', icon: Search, iconColor: 'text-purple-500', title: 'Channel Analysis', description: 'Find your medium.', prompt: 'Research the most effective marketing channels for my target audience' },
      { id: 'content-frequency', icon: Calendar, iconColor: 'text-orange-500', title: 'Posting Analysis', description: 'Timing mastery.', prompt: 'Analyze optimal posting frequency and timing for maximum engagement' },
      { id: 'competitor-pricing', icon: Target, iconColor: 'text-green-500', title: 'Price Intelligence', description: 'Know their rates.', prompt: 'Research and compare pricing models across all major competitors' },
    ],
    [
      { id: 'audience-overlap', icon: Users, iconColor: 'text-rose-500', title: 'Audience Overlap', description: 'Find new reaches.', prompt: 'Identify audience overlap opportunities with complementary brands' },
      { id: 'review-mining', icon: Search, iconColor: 'text-blue-600', title: 'Review Mining', description: 'Gold in feedback.', prompt: 'Extract insights and patterns from customer reviews across platforms' },
      { id: 'content-trends', icon: TrendingUp, iconColor: 'text-violet-600', title: 'Content Trends', description: 'Format evolution.', prompt: 'Research trending content formats and styles in my industry' },
      { id: 'partnership-scan', icon: Sparkles, iconColor: 'text-amber-600', title: 'Partnership Scan', description: 'Strategic allies.', prompt: 'Identify potential brand partnership opportunities in adjacent markets' },
      { id: 'seo-competitor', icon: Target, iconColor: 'text-emerald-600', title: 'SEO Intelligence', description: 'Ranking secrets.', prompt: 'Analyze competitor SEO strategies and identify ranking opportunities' },
      { id: 'engagement-study', icon: BarChart3, iconColor: 'text-pink-600', title: 'Engagement Study', description: 'What resonates.', prompt: 'Study engagement patterns to understand what content resonates most' },
    ],
    [
      { id: 'niche-analysis', icon: Search, iconColor: 'text-slate-600', title: 'Niche Deep Dive', description: 'Own your space.', prompt: 'Conduct a deep analysis of my specific niche and its dynamics' },
      { id: 'influencer-rates', icon: Users, iconColor: 'text-cyan-600', title: 'Influencer Rates', description: 'Budget wisely.', prompt: 'Research influencer pricing and ROI benchmarks in my industry' },
      { id: 'content-lifespan', icon: Calendar, iconColor: 'text-purple-600', title: 'Content Lifespan', description: 'Evergreen vs trend.', prompt: 'Analyze content lifespan and performance decay across platforms' },
      { id: 'brand-voice', icon: Mic, iconColor: 'text-orange-600', title: 'Voice Analysis', description: 'Find your tone.', prompt: 'Research brand voice and messaging strategies of successful brands' },
      { id: 'market-entry', icon: Target, iconColor: 'text-indigo-600', title: 'Market Entry', description: 'New frontiers.', prompt: 'Research new market entry opportunities and expansion strategies' },
      { id: 'customer-segments', icon: BarChart3, iconColor: 'text-teal-600', title: 'Segment Analysis', description: 'Divide to conquer.', prompt: 'Identify and analyze different customer segments for targeted marketing' },
    ],
  ],
  Plan: [
    [
      { id: 'calendar', icon: Calendar, iconColor: 'text-blue-500', title: 'Content Calendar', description: 'Never miss a moment.', prompt: 'Create a 30-day content calendar for Instagram and TikTok for a fashion brand' },
      { id: 'campaign', icon: Target, iconColor: 'text-violet-500', title: 'Campaign Strategy', description: 'Roadmap to results.', prompt: 'Design a product launch campaign strategy with timeline and milestones' },
      { id: 'growth', icon: TrendingUp, iconColor: 'text-emerald-500', title: 'Growth Blueprint', description: 'Scale with precision.', prompt: 'Build a 90-day growth plan to increase social media following by 50%' },
      { id: 'email', icon: Mail, iconColor: 'text-pink-500', title: 'Email Sequence', description: 'Nurture to conversion.', prompt: 'Plan a 7-email welcome sequence for new subscribers' },
      { id: 'launch', icon: Zap, iconColor: 'text-amber-500', title: 'Launch Timeline', description: 'Execute flawlessly.', prompt: 'Create a detailed product launch timeline with daily tasks and checkpoints' },
      { id: 'brand', icon: Sparkles, iconColor: 'text-indigo-500', title: 'Brand Strategy', description: 'Define your empire.', prompt: 'Develop a comprehensive brand positioning strategy and messaging framework' },
    ],
    [
      { id: 'trip-japan', icon: Plane, iconColor: 'text-blue-500', title: 'Dream Trip to Japan', description: 'Flights, hotels, everything.', prompt: 'Plan my dream trip to Japan with complete itinerary including flights, hotels, restaurants, activities, and daily schedules' },
      { id: 'newsletter-2k', icon: Mail, iconColor: 'text-emerald-500', title: 'Newsletter to 2K', description: 'Grow and manage it for me.', prompt: 'Build a newsletter to 2,000 subscribers and manage it for me with content strategy, growth tactics, and automation' },
      { id: 'funnel', icon: Target, iconColor: 'text-red-500', title: 'Sales Funnel', description: 'Guide to conversion.', prompt: 'Design a complete sales funnel from awareness to purchase' },
      { id: 'collab', icon: Users, iconColor: 'text-teal-500', title: 'Collab Strategy', description: 'Grow together.', prompt: 'Plan a strategic collaboration campaign with complementary brands' },
      { id: 'ads', icon: BarChart3, iconColor: 'text-blue-600', title: 'Ad Campaign', description: 'Spend smart.', prompt: 'Create a paid advertising strategy with budget allocation' },
      { id: 'event', icon: Calendar, iconColor: 'text-purple-500', title: 'Event Plan', description: 'Moments that matter.', prompt: 'Plan a virtual launch event with timeline and promotion strategy' },
    ],
    [
      { id: 'vacation-europe', icon: Plane, iconColor: 'text-cyan-500', title: 'Europe Adventure', description: 'Multi-city journey planned.', prompt: 'Plan a 2-week Europe trip covering Paris, Rome, and Barcelona with hotels, activities, and transportation' },
      { id: 'home-renovation', icon: Home, iconColor: 'text-amber-500', title: 'Home Renovation', description: 'Transform your space.', prompt: 'Plan a complete home renovation project with budget, timeline, contractors, and design choices' },
      { id: 'quarterly', icon: Calendar, iconColor: 'text-cyan-500', title: 'Quarterly Goals', description: 'Plan your wins.', prompt: 'Create a quarterly goal-setting framework with OKRs for my business' },
      { id: 'partnership', icon: Users, iconColor: 'text-violet-600', title: 'Partnership Plan', description: 'Strategic alliances.', prompt: 'Develop a partnership outreach strategy with target brands and influencers' },
      { id: 'content-pillars', icon: FileText, iconColor: 'text-blue-500', title: 'Content Pillars', description: 'Foundation for growth.', prompt: 'Define 5 core content pillars with themes and posting frequency' },
      { id: 'monetization', icon: BarChart3, iconColor: 'text-emerald-600', title: 'Monetization Plan', description: 'Revenue streams.', prompt: 'Create a diversified monetization strategy with multiple income streams' },
    ],
    [
      { id: 'wedding', icon: Heart, iconColor: 'text-rose-500', title: 'Wedding Planning', description: 'Your perfect day.', prompt: 'Plan my entire wedding from venue selection to day-of timeline, vendors, budget, and guest management' },
      { id: 'fitness-journey', icon: Heart, iconColor: 'text-green-500', title: 'Fitness Journey', description: 'Transform your health.', prompt: 'Create a 12-week fitness plan with workouts, nutrition, and progress tracking for my specific goals' },
      { id: 'annual', icon: Calendar, iconColor: 'text-indigo-600', title: 'Annual Strategy', description: 'Year of growth.', prompt: 'Build a comprehensive annual marketing strategy with quarterly milestones' },
      { id: 'influencer-plan', icon: Sparkles, iconColor: 'text-amber-600', title: 'Influencer Campaign', description: 'Leverage influence.', prompt: 'Plan an influencer marketing campaign with selection criteria and deliverables' },
      { id: 'seo', icon: Search, iconColor: 'text-green-600', title: 'SEO Strategy', description: 'Organic growth.', prompt: 'Create a 6-month SEO strategy with content and backlink planning' },
      { id: 'product-roadmap', icon: Target, iconColor: 'text-purple-600', title: 'Product Roadmap', description: 'Build with purpose.', prompt: 'Design a product development roadmap with feature prioritization' },
    ],
    [
      { id: 'move-abroad', icon: Globe, iconColor: 'text-blue-500', title: 'Move Abroad', description: 'Relocate seamlessly.', prompt: 'Plan my move abroad including visa, housing, banking, healthcare, and settling-in checklist for my destination country' },
      { id: 'retirement', icon: Wallet, iconColor: 'text-emerald-500', title: 'Retirement Plan', description: 'Secure your future.', prompt: 'Create a comprehensive retirement planning strategy with savings goals, investments, and lifestyle planning' },
      { id: 'video-series', icon: Video, iconColor: 'text-blue-500', title: 'Video Series Plan', description: 'Episodic excellence.', prompt: 'Plan a 12-episode video series with topics, scripts, and release schedule' },
      { id: 'referral', icon: Users, iconColor: 'text-violet-500', title: 'Referral Program', description: 'Grow through fans.', prompt: 'Design a referral program with incentives and tracking mechanisms' },
      { id: 'seasonal-campaign', icon: Calendar, iconColor: 'text-rose-500', title: 'Holiday Campaign', description: 'Seasonal success.', prompt: 'Create a complete holiday marketing campaign with timeline and promotions' },
      { id: 'podcast-plan', icon: Mic, iconColor: 'text-emerald-500', title: 'Podcast Strategy', description: 'Audio empire.', prompt: 'Plan a podcast launch strategy with episode topics and promotion plan' },
    ],
    [
      { id: 'career-switch', icon: Briefcase, iconColor: 'text-indigo-500', title: 'Career Pivot', description: 'New professional chapter.', prompt: 'Plan my career transition including skill gap analysis, learning path, networking strategy, and job search timeline' },
      { id: 'side-hustle', icon: Rocket, iconColor: 'text-orange-500', title: 'Side Hustle Launch', description: 'Extra income stream.', prompt: 'Plan launching a side hustle from idea validation to first customers while keeping my full-time job' },
      { id: 'social-strategy', icon: Sparkles, iconColor: 'text-pink-500', title: 'Social Strategy', description: 'Platform mastery.', prompt: 'Develop a comprehensive social media strategy across all platforms' },
      { id: 'content-repurpose', icon: Zap, iconColor: 'text-indigo-500', title: 'Repurpose Plan', description: 'Maximize content.', prompt: 'Create a content repurposing workflow to multiply reach from each piece' },
      { id: 'lead-nurture', icon: Mail, iconColor: 'text-blue-600', title: 'Nurture Sequence', description: 'Warm to hot.', prompt: 'Plan a lead nurturing email sequence that converts prospects to customers' },
      { id: 'brand-collab', icon: Users, iconColor: 'text-teal-500', title: 'Brand Collab Plan', description: 'Power partnerships.', prompt: 'Create a brand collaboration strategy with outreach templates' },
    ],
    [
      { id: 'book-launch', icon: BookOpen, iconColor: 'text-purple-500', title: 'Book Launch', description: 'Bestseller strategy.', prompt: 'Plan my book launch from writing timeline to marketing, pre-orders, and launch week promotion' },
      { id: 'degree-completion', icon: GraduationCap, iconColor: 'text-blue-600', title: 'Degree Completion', description: 'Finish strong.', prompt: 'Plan completing my degree while working with study schedule, course selection, and time management' },
      { id: 'webinar-series', icon: Video, iconColor: 'text-orange-500', title: 'Webinar Series', description: 'Educate at scale.', prompt: 'Plan a monthly webinar series with topics, guests, and promotion strategy' },
      { id: 'pr-strategy', icon: FileText, iconColor: 'text-slate-600', title: 'PR Strategy', description: 'Earned media.', prompt: 'Create a PR strategy with media outreach plan and story angles' },
      { id: 'loyalty', icon: Sparkles, iconColor: 'text-amber-600', title: 'Loyalty Program', description: 'Reward devotion.', prompt: 'Design a customer loyalty program with tiers and rewards' },
      { id: 'ab-plan', icon: BarChart3, iconColor: 'text-violet-600', title: 'A/B Test Plan', description: 'Data-driven growth.', prompt: 'Create an A/B testing roadmap for optimizing conversion rates' },
    ],
    [
      { id: 'rebrand', icon: Sparkles, iconColor: 'text-orange-500', title: 'Rebrand Plan', description: 'Evolve boldly.', prompt: 'Create a complete rebranding strategy and rollout plan' },
      { id: 'retention', icon: Lightbulb, iconColor: 'text-green-500', title: 'Retention Plan', description: 'Keep them coming.', prompt: 'Design a customer retention strategy with loyalty programs' },
      { id: 'challenge-campaign', icon: Users, iconColor: 'text-rose-500', title: 'Challenge Campaign', description: 'Viral engagement.', prompt: 'Plan a social media challenge campaign to boost engagement and reach' },
      { id: 'content-series', icon: FileText, iconColor: 'text-blue-500', title: 'Blog Series Plan', description: 'Thought leadership.', prompt: 'Plan a 10-part blog series establishing authority in your niche' },
      { id: 'launch-sequence', icon: Zap, iconColor: 'text-pink-600', title: 'Launch Sequence', description: 'Build anticipation.', prompt: 'Create a pre-launch, launch, and post-launch content sequence' },
      { id: 'distribution', icon: TrendingUp, iconColor: 'text-teal-600', title: 'Distribution Plan', description: 'Reach everywhere.', prompt: 'Create a content distribution strategy across owned, earned, and paid channels' },
    ],
  ],
  Automate: [
    [
      { id: 'job-apply', icon: Briefcase, iconColor: 'text-blue-600', title: 'Apply to 100 Jobs', description: 'That match my skills.', prompt: 'Apply to 100 jobs for me that match my skills, experience, and preferences. Handle applications, follow-ups, and tracking.' },
      { id: 'start-business', icon: Building2, iconColor: 'text-emerald-500', title: 'Start & Run Business', description: 'From idea to revenue.', prompt: 'Start and run a business for me from idea to revenue, including market research, setup, operations, and growth strategy' },
      { id: 'autopost', icon: Calendar, iconColor: 'text-blue-500', title: 'Auto-Post', description: 'Set it and forget it.', prompt: 'Set up automated posting schedule for all my social media accounts' },
      { id: 'airesponse', icon: Bot, iconColor: 'text-violet-500', title: 'AI Responses', description: 'Engage 24/7.', prompt: 'Create automated response templates for common customer inquiries' },
      { id: 'lead', icon: Target, iconColor: 'text-red-500', title: 'Lead Capture', description: 'Grow while you sleep.', prompt: 'Build an automated lead generation funnel with email follow-ups' },
      { id: 'repurpose', icon: Zap, iconColor: 'text-amber-500', title: 'Content Repurpose', description: 'One piece, endless reach.', prompt: 'Automatically repurpose my long-form content into shorts, posts, and threads' },
    ],
    [
      { id: 'ecommerce-empire', icon: ShoppingCart, iconColor: 'text-purple-500', title: 'E-commerce Empire', description: 'Store on autopilot.', prompt: 'Build and run an automated e-commerce business with product sourcing, listings, fulfillment, and customer service' },
      { id: 'personal-finance', icon: Wallet, iconColor: 'text-green-500', title: 'Personal Finance', description: 'Money managed for me.', prompt: 'Manage my personal finances automatically including budgeting, bill payments, savings, and investment tracking' },
      { id: 'analytics', icon: BarChart3, iconColor: 'text-emerald-500', title: 'Analytics Reports', description: 'Insights on autopilot.', prompt: 'Set up weekly automated performance reports for all my channels' },
      { id: 'workflow', icon: Lightbulb, iconColor: 'text-cyan-500', title: 'Workflow Builder', description: 'Streamline everything.', prompt: 'Create a content creation workflow that automates repetitive tasks' },
      { id: 'drip', icon: Mail, iconColor: 'text-pink-500', title: 'Drip Campaigns', description: 'Nurture on repeat.', prompt: 'Set up automated email drip campaigns for different customer segments' },
      { id: 'chatbot', icon: Bot, iconColor: 'text-blue-600', title: 'AI Chatbot', description: 'Support that scales.', prompt: 'Create an AI chatbot to handle customer inquiries automatically' },
    ],
    [
      { id: 'content-machine', icon: Sparkles, iconColor: 'text-amber-500', title: 'Content Machine', description: 'Endless content flow.', prompt: 'Create an automated content generation system that produces daily posts, articles, and videos based on my brand' },
      { id: 'email-empire', icon: Mail, iconColor: 'text-rose-500', title: 'Email Empire', description: 'Inbox domination.', prompt: 'Build a complete automated email marketing system with sequences, segments, and optimization' },
      { id: 'invoice', icon: FileText, iconColor: 'text-green-500', title: 'Auto-Invoice', description: 'Get paid faster.', prompt: 'Set up automated invoicing and payment reminders' },
      { id: 'backup', icon: Zap, iconColor: 'text-slate-600', title: 'Content Backup', description: 'Never lose work.', prompt: 'Automate content backup and archiving across platforms' },
      { id: 'review', icon: Sparkles, iconColor: 'text-amber-500', title: 'Review Requests', description: 'Social proof on auto.', prompt: 'Set up automated review request emails after purchase' },
      { id: 'onboard', icon: Users, iconColor: 'text-purple-500', title: 'Auto-Onboarding', description: 'Welcome effortlessly.', prompt: 'Create an automated onboarding sequence for new customers' },
    ],
    [
      { id: 'social-listen', icon: Search, iconColor: 'text-teal-500', title: 'Social Listening', description: 'Never miss a mention.', prompt: 'Set up automated social listening alerts for brand mentions and keywords' },
      { id: 'content-queue', icon: Calendar, iconColor: 'text-violet-600', title: 'Content Queue', description: 'Endless content flow.', prompt: 'Build an automated content queue that never runs dry' },
      { id: 'ab-testing', icon: BarChart3, iconColor: 'text-rose-500', title: 'A/B Testing', description: 'Optimize automatically.', prompt: 'Set up automated A/B testing for email subject lines and content' },
      { id: 'upsell', icon: TrendingUp, iconColor: 'text-emerald-600', title: 'Auto-Upsell', description: 'Maximize value.', prompt: 'Create automated upsell and cross-sell sequences after purchase' },
      { id: 'birthday', icon: Sparkles, iconColor: 'text-pink-600', title: 'Birthday Campaigns', description: 'Personal touch at scale.', prompt: 'Set up automated birthday and anniversary emails for customers' },
      { id: 'win-back', icon: Mail, iconColor: 'text-orange-600', title: 'Win-Back Emails', description: 'Recover lost customers.', prompt: 'Create automated win-back email campaigns for inactive subscribers' },
    ],
    [
      { id: 'lead-scoring', icon: Target, iconColor: 'text-indigo-600', title: 'Lead Scoring', description: 'Prioritize automatically.', prompt: 'Set up automated lead scoring based on engagement and behavior' },
      { id: 'content-recycle', icon: Zap, iconColor: 'text-cyan-600', title: 'Content Recycling', description: 'Evergreen on autopilot.', prompt: 'Automate recycling of top-performing evergreen content' },
      { id: 'feedback', icon: Users, iconColor: 'text-blue-500', title: 'Feedback Collection', description: 'Insights without effort.', prompt: 'Set up automated feedback collection at key customer touchpoints' },
      { id: 'affiliate', icon: BarChart3, iconColor: 'text-green-600', title: 'Affiliate Tracking', description: 'Commissions automated.', prompt: 'Automate affiliate tracking, reporting, and commission payouts' },
      { id: 'event-follow', icon: Calendar, iconColor: 'text-purple-600', title: 'Event Follow-ups', description: 'Post-event engagement.', prompt: 'Create automated follow-up sequences after webinars and events' },
      { id: 'segmentation', icon: Users, iconColor: 'text-amber-600', title: 'Auto-Segmentation', description: 'Smart audience groups.', prompt: 'Set up automated audience segmentation based on behavior and preferences' },
    ],
    [
      { id: 'welcome-series', icon: Mail, iconColor: 'text-blue-500', title: 'Welcome Series', description: 'First steps automated.', prompt: 'Create an automated welcome email series for new subscribers' },
      { id: 'cart-abandon', icon: Target, iconColor: 'text-red-500', title: 'Cart Recovery', description: 'Rescue lost sales.', prompt: 'Set up automated cart abandonment email sequences' },
      { id: 'content-curation', icon: Lightbulb, iconColor: 'text-violet-500', title: 'Content Curation', description: 'Curate effortlessly.', prompt: 'Automate content curation and sharing from industry sources' },
      { id: 'social-dm', icon: Bot, iconColor: 'text-pink-500', title: 'DM Automation', description: 'Personal at scale.', prompt: 'Set up automated DM responses and welcome messages' },
      { id: 'reporting', icon: BarChart3, iconColor: 'text-emerald-500', title: 'Auto-Reports', description: 'Data delivered.', prompt: 'Automate weekly and monthly performance reports for stakeholders' },
      { id: 'task-assign', icon: Users, iconColor: 'text-amber-500', title: 'Task Automation', description: 'Team efficiency.', prompt: 'Automate task assignment and workflow triggers for your team' },
    ],
    [
      { id: 'price-monitor', icon: TrendingUp, iconColor: 'text-cyan-500', title: 'Price Monitoring', description: 'Competitive edge.', prompt: 'Set up automated competitor price monitoring and alerts' },
      { id: 'inventory-alert', icon: Zap, iconColor: 'text-orange-500', title: 'Inventory Alerts', description: 'Never stock out.', prompt: 'Automate inventory level monitoring and restock alerts' },
      { id: 'testimonial-collect', icon: Sparkles, iconColor: 'text-indigo-500', title: 'Testimonial Collector', description: 'Stories on autopilot.', prompt: 'Automate collection and display of customer testimonials' },
      { id: 'content-schedule', icon: Calendar, iconColor: 'text-teal-500', title: 'Smart Scheduling', description: 'Optimal timing.', prompt: 'Set up AI-powered content scheduling for optimal engagement times' },
      { id: 'lead-routing', icon: Target, iconColor: 'text-purple-500', title: 'Lead Routing', description: 'Right person, fast.', prompt: 'Automate lead routing to the appropriate sales team members' },
      { id: 'survey-trigger', icon: FileText, iconColor: 'text-blue-600', title: 'Survey Triggers', description: 'Timely feedback.', prompt: 'Set up automated survey triggers at key customer journey points' },
    ],
    [
      { id: 'renewal-remind', icon: Mail, iconColor: 'text-rose-500', title: 'Renewal Reminders', description: 'Reduce churn.', prompt: 'Automate subscription renewal reminders and incentives' },
      { id: 'content-approval', icon: Users, iconColor: 'text-green-500', title: 'Approval Workflow', description: 'Streamlined review.', prompt: 'Set up automated content approval workflows with notifications' },
      { id: 'hashtag-auto', icon: Search, iconColor: 'text-violet-600', title: 'Smart Hashtags', description: 'Tags that work.', prompt: 'Automate hashtag research and application for social posts' },
      { id: 'crm-sync', icon: Zap, iconColor: 'text-amber-600', title: 'CRM Sync', description: 'Data flows.', prompt: 'Automate data sync between marketing tools and CRM' },
      { id: 'milestone-email', icon: Sparkles, iconColor: 'text-pink-600', title: 'Milestone Emails', description: 'Celebrate success.', prompt: 'Create automated emails for customer milestones and achievements' },
      { id: 'link-check', icon: Target, iconColor: 'text-cyan-600', title: 'Link Checker', description: 'No broken links.', prompt: 'Automate broken link detection and notification across content' },
    ],
  ],
};

interface AISuggestionsGridProps {
  intent: string | null;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

// Helper function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const AISuggestionsGrid = ({ intent, onSuggestionClick }: AISuggestionsGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [shuffledSuggestions, setShuffledSuggestions] = useState<Suggestion[] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Reset page and shuffled suggestions when intent changes
  useEffect(() => {
    setCurrentPage(0);
    setShuffledSuggestions(null);
    setShuffleKey(0);
  }, [intent]);

  // Don't render if no intent is selected
  if (!intent) {
    return null;
  }

  const intentKey = intent;
  const allPages = suggestionsByIntent[intentKey] || suggestionsByIntent.Create;
  const allSuggestions = allPages.flat(); // All 24 suggestions for shuffling
  const displayPages = allPages.slice(0, 2); // Only show first 2 pages (12 suggestions)
  const totalPages = displayPages.length;
  
  // Use shuffled suggestions if available, otherwise use paged suggestions
  const currentSuggestions = shuffledSuggestions || displayPages[currentPage] || displayPages[0];

  const handlePrev = () => {
    setShuffledSuggestions(null); // Clear shuffled state when using arrows
    setShuffleKey(0);
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setShuffledSuggestions(null); // Clear shuffled state when using arrows
    setShuffleKey(0);
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleNewIdea = () => {
    // Start spin animation
    setIsSpinning(true);
    
    // Shuffle all suggestions for this intent and take first 6
    const shuffled = shuffleArray(allSuggestions).slice(0, 6);
    setShuffledSuggestions(shuffled);
    setShuffleKey(prev => prev + 1); // Force re-render with new key
    
    // Stop spin animation after 500ms
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  };

  return (
    <div className="w-full mx-auto mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-700">
          Not Sure Where To Start? Try One Of These...
        </h3>
        <div className="flex items-center gap-2">
          <IconTooltip label="More Ideas" side="top">
            <button
              onClick={handleNewIdea}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="New idea"
            >
              <RefreshCw 
                size={16} 
                className={`text-slate-600 transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`} 
              />
            </button>
          </IconTooltip>
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Previous suggestions"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Next suggestions"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentSuggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={`${suggestion.id}-${shuffleKey}`}
              onClick={() => onSuggestionClick(suggestion)}
              className="flex items-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <IconComponent size={18} className={suggestion.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 text-sm">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {suggestion.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AISuggestionsGrid;
