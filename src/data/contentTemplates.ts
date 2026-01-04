// Comprehensive Content Templates Library

export type ContentType = 
  | 'social-post' 
  | 'article' 
  | 'press-release' 
  | 'email' 
  | 'ad-copy' 
  | 'video-script' 
  | 'carousel' 
  | 'story' 
  | 'thread' 
  | 'newsletter'
  | 'product-description'
  | 'case-study'
  | 'testimonial'
  | 'infographic'
  | 'podcast-notes';

export type ContentCategory = 
  | 'promotional'
  | 'engagement'
  | 'educational'
  | 'announcement'
  | 'storytelling'
  | 'thought-leadership'
  | 'behind-the-scenes'
  | 'user-generated'
  | 'seasonal'
  | 'brand-awareness'
  | 'conversion'
  | 'community'
  | 'custom';

export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube' | 'pinterest' | 'threads' | 'all';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  contentType: ContentType;
  category: ContentCategory;
  caption: string;
  hashtags: string[];
  isFavorite: boolean;
  usageCount: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestFor: string[];
  proTip?: string;
}

export const contentTypeInfo: Record<ContentType, { label: string; icon: string; color: string }> = {
  'social-post': { label: 'Social Post', icon: '📱', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'article': { label: 'Article', icon: '📝', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  'press-release': { label: 'Press Release', icon: '📰', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  'email': { label: 'Email', icon: '✉️', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'ad-copy': { label: 'Ad Copy', icon: '🎯', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'video-script': { label: 'Video Script', icon: '🎬', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'carousel': { label: 'Carousel', icon: '🎠', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  'story': { label: 'Story', icon: '⭕', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'thread': { label: 'Thread', icon: '🧵', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  'newsletter': { label: 'Newsletter', icon: '📧', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  'product-description': { label: 'Product Description', icon: '🏷️', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'case-study': { label: 'Case Study', icon: '📊', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'testimonial': { label: 'Testimonial', icon: '💬', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  'infographic': { label: 'Infographic', icon: '📈', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  'podcast-notes': { label: 'Podcast Notes', icon: '🎙️', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
};

export const categoryInfo: Record<ContentCategory, { label: string; icon: string; color: string }> = {
  'promotional': { label: 'Promotional', icon: '📣', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'engagement': { label: 'Engagement', icon: '💬', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  'educational': { label: 'Educational', icon: '🎓', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'announcement': { label: 'Announcement', icon: '📢', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'storytelling': { label: 'Storytelling', icon: '📖', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  'thought-leadership': { label: 'Thought Leadership', icon: '💡', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  'behind-the-scenes': { label: 'Behind the Scenes', icon: '🎬', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'user-generated': { label: 'User Generated', icon: '👥', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  'seasonal': { label: 'Seasonal', icon: '🎄', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'brand-awareness': { label: 'Brand Awareness', icon: '🌟', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  'conversion': { label: 'Conversion', icon: '🎯', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'community': { label: 'Community', icon: '🤝', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  'custom': { label: 'Custom', icon: '✏️', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
};

export const defaultTemplates: ContentTemplate[] = [
  // THOUGHT LEADERSHIP TEMPLATES
  {
    id: 'tl1',
    name: 'The Bold Contrarian',
    description: 'Challenge conventional wisdom and position yourself as a forward thinker',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'thought-leadership',
    caption: "Unpopular opinion: [Controversial statement]\n\nHere's why I believe this:\n\n1. [Reason 1]\n2. [Reason 2]\n3. [Reason 3]\n\nThe industry has been doing [X] for years, but what if there's a better way?\n\n[Call to discussion]",
    hashtags: ['leadership', 'innovation', 'futureofwork'],
    isFavorite: true,
    usageCount: 42,
    estimatedTime: '10 min',
    difficulty: 'intermediate',
    bestFor: ['Personal branding', 'Industry experts', 'Consultants'],
    proTip: 'Back up your contrarian view with data or personal experience',
  },
  {
    id: 'tl2',
    name: 'Strategic Insight',
    description: 'Share a missing strategic element that most leaders overlook',
    platform: 'linkedin',
    contentType: 'thread',
    category: 'thought-leadership',
    caption: "Most leaders focus on [Common Focus].\n\nBut they're missing the one thing that actually drives results:\n\n[Your Strategic Insight]\n\nHere's how to implement it:\n\n🔹 Step 1: [Action]\n🔹 Step 2: [Action]\n🔹 Step 3: [Action]\n\nThe companies that get this right are [X]% more likely to [Outcome].",
    hashtags: ['strategy', 'leadership', 'businessgrowth'],
    isFavorite: false,
    usageCount: 28,
    estimatedTime: '15 min',
    difficulty: 'advanced',
    bestFor: ['Executives', 'Consultants', 'B2B brands'],
  },
  {
    id: 'tl3',
    name: 'Legacy Builder',
    description: 'Share insights about building lasting impact',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'thought-leadership',
    caption: "In 10 years, no one will remember [Short-term metric].\n\nBut they'll remember:\n\n• The teams you built\n• The people you mentored\n• The problems you solved\n• The culture you created\n\nLegacy isn't built in quarterly reports.\n\nIt's built in daily decisions.\n\nWhat decision are you making today for tomorrow's impact?",
    hashtags: ['leadership', 'legacy', 'impact'],
    isFavorite: true,
    usageCount: 56,
    estimatedTime: '8 min',
    difficulty: 'beginner',
    bestFor: ['Leaders', 'Mentors', 'Coaches'],
  },
  {
    id: 'tl4',
    name: 'Future Self Reflection',
    description: 'Use future perspective to bring clarity to current decisions',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'thought-leadership',
    caption: "If the future me could send a message to today's me, it would say:\n\n\"[Insight 1]\"\n\"[Insight 2]\"\n\"[Insight 3]\"\n\nSometimes we need to step out of the present to see it clearly.\n\nWhat would your future self tell you?",
    hashtags: ['personalgrowth', 'reflection', 'mindset'],
    isFavorite: false,
    usageCount: 33,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['Personal brands', 'Coaches', 'Thought leaders'],
  },

  // STORYTELLING TEMPLATES
  {
    id: 'st1',
    name: 'The Pivot Story',
    description: 'Share how a setback became your breakthrough',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'storytelling',
    caption: "3 years ago, I [faced a challenge].\n\nI thought it was the end.\n\nBut it was actually the beginning.\n\nHere's what happened:\n\n[Tell the story in 3-4 paragraphs]\n\nThe lesson? [Key takeaway]\n\nYour biggest setback might be your greatest setup.",
    hashtags: ['storytelling', 'entrepreneurship', 'resilience'],
    isFavorite: true,
    usageCount: 67,
    estimatedTime: '20 min',
    difficulty: 'intermediate',
    bestFor: ['Founders', 'Career changers', 'Personal brands'],
    proTip: 'Be specific with details - vague stories don\'t resonate',
  },
  {
    id: 'st2',
    name: 'Rejection to Redemption',
    description: 'Transform rejection letters into your origin story',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'storytelling',
    caption: "I've collected [X] rejection letters.\n\nEach one taught me something:\n\n❌ Rejection #1: [What you learned]\n❌ Rejection #2: [What you learned]\n❌ Rejection #3: [What you learned]\n\nToday, [Where you are now].\n\nEvery 'no' was research for the eventual 'yes'.\n\nWhat rejection turned into your redirection?",
    hashtags: ['rejection', 'success', 'persistence'],
    isFavorite: false,
    usageCount: 41,
    estimatedTime: '15 min',
    difficulty: 'intermediate',
    bestFor: ['Job seekers', 'Entrepreneurs', 'Sales professionals'],
  },
  {
    id: 'st3',
    name: 'Unexpected Teacher',
    description: 'Share wisdom learned from an unconventional source',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'storytelling',
    caption: "The best leadership advice I ever received came from [Unexpected source].\n\nThey said: \"[Quote]\"\n\nAt first, I didn't understand.\n\nBut now I realize:\n\n[Explain the deeper meaning]\n\nWisdom doesn't care about credentials.\n\nIt shows up when you're ready to receive it.",
    hashtags: ['leadership', 'wisdom', 'learning'],
    isFavorite: false,
    usageCount: 29,
    estimatedTime: '12 min',
    difficulty: 'beginner',
    bestFor: ['Leaders', 'Mentors', 'Anyone with unique experiences'],
  },
  {
    id: 'st4',
    name: 'The Calculated Risk',
    description: 'Share a risk that terrified you but paid off',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'storytelling',
    caption: "The scariest decision I ever made:\n\n[The risk you took]\n\nEveryone said I was crazy.\n\nMy own doubts screamed louder than my confidence.\n\nBut I did it anyway.\n\nResult: [The outcome]\n\nCalculated risks aren't about being fearless.\n\nThey're about being more afraid of regret than failure.\n\nWhat's the risk you've been avoiding?",
    hashtags: ['risktaking', 'entrepreneur', 'courage'],
    isFavorite: true,
    usageCount: 52,
    estimatedTime: '15 min',
    difficulty: 'intermediate',
    bestFor: ['Entrepreneurs', 'Career changers', 'Founders'],
  },

  // ENGAGEMENT TEMPLATES
  {
    id: 'eng1',
    name: 'This or That',
    description: 'Create a fun debate with two options',
    platform: 'instagram',
    contentType: 'story',
    category: 'engagement',
    caption: "Quick question! 🤔\n\n[Option A] or [Option B]?\n\n👆 Tap to vote!\n\nI'll share the results tomorrow 📊",
    hashtags: ['thisorthat', 'poll', 'community'],
    isFavorite: true,
    usageCount: 89,
    estimatedTime: '5 min',
    difficulty: 'beginner',
    bestFor: ['All brands', 'Quick engagement', 'Stories'],
  },
  {
    id: 'eng2',
    name: 'Hot Take Challenge',
    description: 'Share an opinion and invite debate',
    platform: 'twitter',
    contentType: 'social-post',
    category: 'engagement',
    caption: "Hot take: [Your opinion] 🔥\n\nAgree or disagree?\n\nDrop a 🔥 if you agree\nDrop a ❄️ if you disagree\n\nLet's debate 👇",
    hashtags: ['hottake', 'debate', 'opinion'],
    isFavorite: false,
    usageCount: 76,
    estimatedTime: '5 min',
    difficulty: 'beginner',
    bestFor: ['Personal brands', 'Industry discussions', 'Building community'],
  },
  {
    id: 'eng3',
    name: 'Caption This',
    description: 'Let your audience get creative with an image',
    platform: 'instagram',
    contentType: 'social-post',
    category: 'engagement',
    caption: "Caption this! 👇\n\n[Image description context]\n\nBest caption gets a shoutout in our stories! 🏆\n\nBe creative - we know you've got this! ✨",
    hashtags: ['captionthis', 'creative', 'community'],
    isFavorite: false,
    usageCount: 54,
    estimatedTime: '5 min',
    difficulty: 'beginner',
    bestFor: ['Fun brands', 'Community building', 'User engagement'],
  },
  {
    id: 'eng4',
    name: 'Fill in the Blank',
    description: 'Simple engagement that gets people typing',
    platform: 'twitter',
    contentType: 'social-post',
    category: 'engagement',
    caption: "Fill in the blank:\n\nThe one thing I wish I knew before [Topic] is _______.\n\nI'll go first: [Your answer]\n\nYour turn! 👇",
    hashtags: ['community', 'share', 'tips'],
    isFavorite: true,
    usageCount: 112,
    estimatedTime: '5 min',
    difficulty: 'beginner',
    bestFor: ['All niches', 'Quick engagement', 'Building discussion'],
  },

  // PROMOTIONAL TEMPLATES
  {
    id: 'promo1',
    name: 'Product Launch Hype',
    description: 'Build excitement for your upcoming launch',
    platform: 'instagram',
    contentType: 'carousel',
    category: 'promotional',
    caption: "🚀 Something BIG is coming...\n\nSlide 1: The Problem ➡️\nSlide 2: What We Built ➡️\nSlide 3: Key Features ➡️\nSlide 4: Early Access Info\n\n✨ Be the first to know - link in bio!\n\nWho's excited? 🙋‍♀️",
    hashtags: ['launch', 'newproduct', 'comingsoon'],
    isFavorite: true,
    usageCount: 78,
    estimatedTime: '30 min',
    difficulty: 'intermediate',
    bestFor: ['Product launches', 'App releases', 'Course launches'],
    proTip: 'Create FOMO with exclusive early access or limited spots',
  },
  {
    id: 'promo2',
    name: 'Flash Sale Urgency',
    description: 'Create urgency for limited-time offers',
    platform: 'instagram',
    contentType: 'story',
    category: 'promotional',
    caption: "⚡ FLASH SALE ⚡\n\n[X]% OFF for the next [X] hours only!\n\n🕐 Ends: [Time]\n💰 Use code: [CODE]\n🛒 Link in bio\n\nDon't sleep on this one! ⏰",
    hashtags: ['flashsale', 'discount', 'limitedtime'],
    isFavorite: false,
    usageCount: 45,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['E-commerce', 'Digital products', 'Services'],
  },
  {
    id: 'promo3',
    name: 'Problem-Solution Ad',
    description: 'Position your product as the solution',
    platform: 'facebook',
    contentType: 'ad-copy',
    category: 'promotional',
    caption: "Tired of [Pain Point]?\n\nYou're not alone. [Statistic or common experience].\n\nThat's why we created [Product Name].\n\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\n[Social proof: testimonial or number]\n\n👉 [CTA with link]",
    hashtags: ['solution', 'productivity', 'gamechanger'],
    isFavorite: true,
    usageCount: 93,
    estimatedTime: '15 min',
    difficulty: 'intermediate',
    bestFor: ['Ads', 'Landing pages', 'Sales posts'],
  },

  // EDUCATIONAL TEMPLATES
  {
    id: 'edu1',
    name: 'Quick Tips Thread',
    description: 'Share actionable tips in a digestible format',
    platform: 'twitter',
    contentType: 'thread',
    category: 'educational',
    caption: "🧵 [X] [Topic] tips that took me [Y] years to learn:\n\n1/ [Tip 1]\n[Brief explanation]\n\n2/ [Tip 2]\n[Brief explanation]\n\n3/ [Tip 3]\n[Brief explanation]\n\n[Continue...]\n\nBookmark this for later! 🔖\n\nRT to help others learn faster.",
    hashtags: ['tips', 'learning', 'thread'],
    isFavorite: true,
    usageCount: 156,
    estimatedTime: '25 min',
    difficulty: 'intermediate',
    bestFor: ['Educators', 'Coaches', 'Industry experts'],
    proTip: 'Keep each tip to 1-2 sentences for maximum retention',
  },
  {
    id: 'edu2',
    name: 'How-To Carousel',
    description: 'Step-by-step visual guide',
    platform: 'instagram',
    contentType: 'carousel',
    category: 'educational',
    caption: "How to [Achieve Result] in [X] simple steps 👇\n\n📍 Save this for later!\n\nSlide 1: The Goal\nSlide 2-6: Steps 1-5\nSlide 7: Final Result\nSlide 8: Your Turn!\n\nWhich step was most helpful? Comment below! 💬",
    hashtags: ['howto', 'tutorial', 'tips'],
    isFavorite: true,
    usageCount: 134,
    estimatedTime: '45 min',
    difficulty: 'intermediate',
    bestFor: ['Tutorials', 'Guides', 'Process explanations'],
  },
  {
    id: 'edu3',
    name: 'Myth vs Reality',
    description: 'Bust common misconceptions in your industry',
    platform: 'linkedin',
    contentType: 'carousel',
    category: 'educational',
    caption: "5 [Industry] Myths That Are Holding You Back 🚫\n\n❌ MYTH: [Common belief]\n✅ REALITY: [The truth]\n\nSwipe to see all 5 myths debunked →\n\nWhich myth surprised you the most?\n\nSave this and share with someone who needs to see it! 📌",
    hashtags: ['mythbusting', 'facts', 'education'],
    isFavorite: false,
    usageCount: 87,
    estimatedTime: '35 min',
    difficulty: 'intermediate',
    bestFor: ['Industry experts', 'Consultants', 'Educators'],
  },

  // BEHIND THE SCENES TEMPLATES
  {
    id: 'bts1',
    name: 'Day in the Life',
    description: 'Show what a typical day looks like',
    platform: 'instagram',
    contentType: 'carousel',
    category: 'behind-the-scenes',
    caption: "A day in my life as a [Your role] ☀️\n\n5:30 AM - [Morning routine]\n9:00 AM - [Work activity]\n12:00 PM - [Midday]\n3:00 PM - [Afternoon]\n6:00 PM - [Evening]\n\nThe unglamorous truth? [Honest insight]\n\nBut I wouldn't trade it for anything 💚\n\nWhat does your day look like?",
    hashtags: ['dayinthelife', 'behindthescenes', 'entrepreneur'],
    isFavorite: true,
    usageCount: 98,
    estimatedTime: '20 min',
    difficulty: 'beginner',
    bestFor: ['Personal brands', 'Entrepreneurs', 'Creators'],
  },
  {
    id: 'bts2',
    name: 'Work in Progress',
    description: 'Show unfinished work and the process',
    platform: 'instagram',
    contentType: 'social-post',
    category: 'behind-the-scenes',
    caption: "POV: You're watching me [create/build/design] 👀\n\n[Describe what you're working on]\n\nIt's messy. It's imperfect. It's real.\n\nProgress > Perfection\n\nWho else is working on something right now? 🙋‍♀️",
    hashtags: ['workinprogress', 'bts', 'creativeprocess'],
    isFavorite: false,
    usageCount: 67,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['Creatives', 'Makers', 'Designers'],
  },

  // COMMUNITY TEMPLATES
  {
    id: 'comm1',
    name: 'Community Spotlight',
    description: 'Feature a community member or customer',
    platform: 'instagram',
    contentType: 'social-post',
    category: 'community',
    caption: "🌟 COMMUNITY SPOTLIGHT 🌟\n\nMeet @[handle]!\n\n[Their story/achievement]\n\nWe're so proud to have you in our community! 💚\n\nWant to be featured? Tag us in your posts using #[YourHashtag]!",
    hashtags: ['community', 'spotlight', 'customerlove'],
    isFavorite: true,
    usageCount: 43,
    estimatedTime: '15 min',
    difficulty: 'beginner',
    bestFor: ['Brand building', 'Community engagement', 'Social proof'],
  },
  {
    id: 'comm2',
    name: 'AMA Announcement',
    description: 'Invite your audience to ask questions',
    platform: 'instagram',
    contentType: 'story',
    category: 'community',
    caption: "🎤 AMA TIME! 🎤\n\nI'm answering YOUR questions about [Topic]\n\n📍 Drop your questions below\n⏰ Answering for the next [X] hours\n\nNothing is off limits!\n\nAsk away 👇",
    hashtags: ['ama', 'askme', 'community'],
    isFavorite: false,
    usageCount: 56,
    estimatedTime: '5 min',
    difficulty: 'beginner',
    bestFor: ['Personal brands', 'Experts', 'Community building'],
  },

  // SEASONAL TEMPLATES
  {
    id: 'seas1',
    name: 'Year-End Reflection',
    description: 'Share lessons and gratitude from the year',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'seasonal',
    caption: "As [Year] comes to an end, I'm reflecting on:\n\n🏆 Biggest Win: [Achievement]\n📚 Biggest Lesson: [Learning]\n🙏 Most Grateful For: [Gratitude]\n🎯 2024 Focus: [Goal]\n\nWhat a year it's been.\n\nWhat's your biggest lesson from [Year]?",
    hashtags: ['yearinreview', 'reflection', 'newyear'],
    isFavorite: true,
    usageCount: 78,
    estimatedTime: '15 min',
    difficulty: 'beginner',
    bestFor: ['End of year', 'Personal brands', 'Everyone'],
  },
  {
    id: 'seas2',
    name: 'Holiday Gratitude',
    description: 'Express gratitude during holidays',
    platform: 'instagram',
    contentType: 'social-post',
    category: 'seasonal',
    caption: "This [Holiday], we're grateful for YOU 💚\n\n• [X] amazing customers\n• [X] countries reached\n• [X] lives impacted\n\nFrom our team to yours - thank you for being part of our journey.\n\nHappy [Holiday]! 🎉\n\nWhat are you grateful for today?",
    hashtags: ['grateful', 'holiday', 'thankyou'],
    isFavorite: false,
    usageCount: 34,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['Holiday posts', 'Brand humanization', 'Community connection'],
  },

  // VIDEO SCRIPT TEMPLATES
  {
    id: 'vid1',
    name: 'Hook-Story-Offer',
    description: 'Classic video structure that converts',
    platform: 'tiktok',
    contentType: 'video-script',
    category: 'promotional',
    caption: "[HOOK - 0:00]\n\"Stop scrolling if you [target audience identifier]...\"\n\n[STORY - 0:05]\n\"I used to [struggle/problem]...\nThen I discovered [solution]...\nNow I [result]...\"\n\n[OFFER - 0:30]\n\"Want the same results? Here's how:\n[CTA]\"",
    hashtags: ['videoscript', 'viral', 'marketing'],
    isFavorite: true,
    usageCount: 167,
    estimatedTime: '20 min',
    difficulty: 'intermediate',
    bestFor: ['TikTok', 'Reels', 'YouTube Shorts'],
    proTip: 'First 3 seconds determine if people keep watching',
  },
  {
    id: 'vid2',
    name: 'Tutorial Format',
    description: 'Step-by-step video teaching something',
    platform: 'youtube',
    contentType: 'video-script',
    category: 'educational',
    caption: "[INTRO - 0:00]\n\"In this video, I'll show you exactly how to [Result]\"\n\n[WHY IT MATTERS - 0:15]\n\"Here's why this is important...\"\n\n[STEP 1 - 0:45]\n[STEP 2 - 2:00]\n[STEP 3 - 3:30]\n\n[RECAP - 5:00]\n\"To summarize...\"\n\n[CTA - 5:30]\n\"If this helped, subscribe for more!\"",
    hashtags: ['tutorial', 'howto', 'learn'],
    isFavorite: true,
    usageCount: 89,
    estimatedTime: '30 min',
    difficulty: 'intermediate',
    bestFor: ['YouTube', 'Educational content', 'Tutorials'],
  },

  // PRESS RELEASE TEMPLATES
  {
    id: 'pr1',
    name: 'Product Launch Press Release',
    description: 'Announce a new product to media',
    platform: 'all',
    contentType: 'press-release',
    category: 'announcement',
    caption: "[HEADLINE]\n[Company] Launches [Product Name] to [Solve Problem]\n\n[SUBHEADLINE]\n[One-line benefit statement]\n\n[CITY, DATE] — [Company name], [brief company description], today announced the launch of [Product name], [brief product description].\n\n[Quote from executive]\n\n[Product details and features]\n\n[Availability and pricing]\n\n[Boilerplate about company]\n\n[Media contact info]",
    hashtags: ['pressrelease', 'launch', 'news'],
    isFavorite: false,
    usageCount: 23,
    estimatedTime: '45 min',
    difficulty: 'advanced',
    bestFor: ['PR', 'Product launches', 'Media outreach'],
  },

  // EMAIL TEMPLATES
  {
    id: 'email1',
    name: 'Welcome Sequence Email',
    description: 'Welcome new subscribers warmly',
    platform: 'all',
    contentType: 'email',
    category: 'conversion',
    caption: "Subject: Welcome to [Brand]! Here's your [Freebie] 🎁\n\nHi [Name]!\n\nSo excited you're here!\n\n[Quick intro about who you are and what you do]\n\nAs promised, here's your [Freebie]: [Link]\n\nOver the next few days, I'll be sharing:\n• [Value 1]\n• [Value 2]\n• [Value 3]\n\nHit reply and tell me - what's your biggest challenge with [Topic]?\n\nTalk soon,\n[Your name]",
    hashtags: ['emailmarketing', 'welcome', 'nurture'],
    isFavorite: true,
    usageCount: 112,
    estimatedTime: '20 min',
    difficulty: 'beginner',
    bestFor: ['Email sequences', 'Lead nurturing', 'Onboarding'],
  },
  {
    id: 'email2',
    name: 'Cart Abandonment Email',
    description: 'Recover abandoned carts with urgency',
    platform: 'all',
    contentType: 'email',
    category: 'conversion',
    caption: "Subject: Did something go wrong? 🛒\n\nHi [Name],\n\nI noticed you left something in your cart!\n\n[Product image and details]\n\nStill thinking it over? Here's what others are saying:\n\n\"[Testimonial]\" - [Customer name]\n\n✨ Complete your order in the next 24 hours and get [Incentive].\n\n[CTA Button: Complete My Order]\n\nQuestions? Just reply to this email!\n\n[Your name]",
    hashtags: ['ecommerce', 'cartrecovery', 'email'],
    isFavorite: false,
    usageCount: 67,
    estimatedTime: '15 min',
    difficulty: 'beginner',
    bestFor: ['E-commerce', 'Sales recovery', 'Urgency'],
  },

  // NEWSLETTER TEMPLATES
  {
    id: 'news1',
    name: 'Weekly Roundup Newsletter',
    description: 'Curated weekly content digest',
    platform: 'all',
    contentType: 'newsletter',
    category: 'educational',
    caption: "# [Newsletter Name] - Issue #[X]\n\n## This Week's Highlights\n\n### 📌 Top Story\n[Summary and link]\n\n### 💡 Quick Tip\n[Actionable tip]\n\n### 📚 Worth Reading\n• [Link 1]\n• [Link 2]\n• [Link 3]\n\n### 🎯 Action Item\n[One thing readers should do this week]\n\n---\n\nSee you next week!\n[Your name]",
    hashtags: ['newsletter', 'weekly', 'digest'],
    isFavorite: true,
    usageCount: 78,
    estimatedTime: '40 min',
    difficulty: 'intermediate',
    bestFor: ['Content creators', 'Thought leaders', 'Curators'],
  },

  // TESTIMONIAL TEMPLATES
  {
    id: 'test1',
    name: 'Customer Story Spotlight',
    description: 'Feature a customer success story',
    platform: 'instagram',
    contentType: 'testimonial',
    category: 'user-generated',
    caption: "🌟 CUSTOMER STORY 🌟\n\n\"[Customer quote about their transformation]\"\n\n📍 Meet [Customer name]\n\nBefore: [Their challenge]\nAfter: [Their result]\n\nWe're so proud of you, [Name]! 💚\n\nWant results like [Name]? Link in bio to get started.",
    hashtags: ['testimonial', 'customerstory', 'results'],
    isFavorite: true,
    usageCount: 56,
    estimatedTime: '15 min',
    difficulty: 'beginner',
    bestFor: ['Social proof', 'Trust building', 'Sales'],
  },

  // PRODUCT DESCRIPTION TEMPLATES
  {
    id: 'pd1',
    name: 'Feature-Benefit Description',
    description: 'Highlight features with clear benefits',
    platform: 'all',
    contentType: 'product-description',
    category: 'promotional',
    caption: "[Product Name]\n\n[One-line hook that captures attention]\n\n[2-3 sentence overview]\n\n✨ FEATURES & BENEFITS:\n\n🔹 [Feature 1] — [Benefit]\n🔹 [Feature 2] — [Benefit]\n🔹 [Feature 3] — [Benefit]\n\n⭐ PERFECT FOR:\n• [Ideal customer 1]\n• [Ideal customer 2]\n• [Ideal customer 3]\n\n[Social proof: rating or testimonial snippet]\n\n[Price and CTA]",
    hashtags: ['product', 'shopnow', 'mustahave'],
    isFavorite: false,
    usageCount: 89,
    estimatedTime: '25 min',
    difficulty: 'intermediate',
    bestFor: ['E-commerce', 'Product pages', 'Listings'],
  },

  // CASE STUDY TEMPLATES
  {
    id: 'cs1',
    name: 'Results-Focused Case Study',
    description: 'Showcase client results with data',
    platform: 'linkedin',
    contentType: 'case-study',
    category: 'promotional',
    caption: "📊 CASE STUDY: How [Client] achieved [Result]\n\n🎯 THE CHALLENGE:\n[Client]'s biggest obstacle was [Problem].\n\n💡 THE SOLUTION:\nWe implemented [Your solution] with a focus on:\n• [Strategy 1]\n• [Strategy 2]\n• [Strategy 3]\n\n📈 THE RESULTS:\n• [Metric 1]: [X]% increase\n• [Metric 2]: [X]% improvement\n• [Metric 3]: [X] achieved\n\n💬 CLIENT QUOTE:\n\"[Testimonial]\"\n\nWant similar results? [CTA]",
    hashtags: ['casestudy', 'results', 'success'],
    isFavorite: true,
    usageCount: 34,
    estimatedTime: '45 min',
    difficulty: 'advanced',
    bestFor: ['B2B', 'Agencies', 'Consultants'],
  },

  // ORIGINAL TEMPLATES (Updated)
  {
    id: 't1',
    name: 'Product Launch',
    description: 'Perfect for announcing new products or features',
    platform: 'instagram',
    contentType: 'social-post',
    category: 'promotional',
    caption: '🚀 Exciting news! Introducing [Product Name] - the [benefit]. Available now!\n\n✨ Key Features:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\nLink in bio to learn more! 👆',
    hashtags: ['newlaunch', 'productlaunch', 'newproduct', 'exciting'],
    isFavorite: true,
    usageCount: 24,
    estimatedTime: '15 min',
    difficulty: 'beginner',
    bestFor: ['Product launches', 'Features', 'Updates'],
  },
  {
    id: 't2',
    name: 'Engagement Question',
    description: 'Boost engagement with a question post',
    platform: 'twitter',
    contentType: 'social-post',
    category: 'engagement',
    caption: "We're curious! 🤔\n\n[Question about your niche]\n\nDrop your answer below! 👇",
    hashtags: ['community', 'feedback', 'tellus'],
    isFavorite: false,
    usageCount: 18,
    estimatedTime: '5 min',
    difficulty: 'beginner',
    bestFor: ['Community building', 'Feedback', 'Engagement'],
  },
  {
    id: 't3',
    name: 'Educational Tip',
    description: 'Share valuable tips with your audience',
    platform: 'linkedin',
    contentType: 'social-post',
    category: 'educational',
    caption: "💡 Quick Tip:\n\n[Your tip here]\n\nWhy does this matter?\n\n[Explanation]\n\nWhat tips have worked for you? Share below!",
    hashtags: ['tips', 'learning', 'education', 'growth'],
    isFavorite: true,
    usageCount: 31,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['Value posts', 'Industry tips', 'Education'],
  },
  {
    id: 't4',
    name: 'Behind The Scenes',
    description: 'Show your authentic side',
    platform: 'instagram',
    contentType: 'social-post',
    category: 'behind-the-scenes',
    caption: "Take a peek behind the curtain! 🎬\n\n[Describe what's happening]\n\nThis is what [doing X] really looks like. What do you think?",
    hashtags: ['behindthescenes', 'bts', 'dayinthelife', 'reallife'],
    isFavorite: false,
    usageCount: 12,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['Authenticity', 'Brand personality', 'Connection'],
  },
  {
    id: 't5',
    name: 'Sale Announcement',
    description: 'Promote sales and discounts',
    platform: 'facebook',
    contentType: 'ad-copy',
    category: 'promotional',
    caption: "🎉 SALE ALERT! 🎉\n\n[X]% OFF everything!\n\n⏰ Limited time only - ends [date]\n\n🛒 Shop now: [link]\n\nDon't miss out!",
    hashtags: ['sale', 'discount', 'limitedtime', 'shopnow'],
    isFavorite: false,
    usageCount: 8,
    estimatedTime: '10 min',
    difficulty: 'beginner',
    bestFor: ['Sales', 'Promotions', 'Urgency'],
  },
];

// Filter utilities
export const getTemplatesByContentType = (templates: ContentTemplate[], type: ContentType) => 
  templates.filter(t => t.contentType === type);

export const getTemplatesByCategory = (templates: ContentTemplate[], category: ContentCategory) => 
  templates.filter(t => t.category === category);

export const getTemplatesByPlatform = (templates: ContentTemplate[], platform: Platform) => 
  templates.filter(t => t.platform === platform || t.platform === 'all');

export const getFavoriteTemplates = (templates: ContentTemplate[]) => 
  templates.filter(t => t.isFavorite);

export const getPopularTemplates = (templates: ContentTemplate[], limit = 10) => 
  [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
