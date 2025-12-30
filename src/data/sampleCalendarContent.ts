export interface CalendarContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: 'draft' | 'scheduled' | 'published';
  imageUrl?: string;
  type?: 'post' | 'story' | 'carousel' | 'reel';
  caption?: string;
  hashtags?: string[];
  accountName?: string;
  accountHandle?: string;
}

// Get dates relative to current month for demo
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const createDate = (day: number, hour: number = 9, minute: number = 0) => {
  return new Date(currentYear, currentMonth, day, hour, minute);
};

export const sampleCalendarContent: CalendarContentItem[] = [
  // Today's posts
  {
    id: '1',
    title: 'New product launch announcement! 🚀 Check out our latest innovation that\'s going to change the game.',
    platform: 'instagram',
    date: createDate(today.getDate(), 10, 0),
    status: 'scheduled',
    type: 'carousel',
    caption: 'New product launch announcement! 🚀 Check out our latest innovation that\'s going to change the game. Link in bio for early access.',
    hashtags: ['ProductLaunch', 'Innovation', 'NewProduct', 'ComingSoon'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  {
    id: '2',
    title: 'Behind the scenes look at our creative process',
    platform: 'tiktok',
    date: createDate(today.getDate(), 14, 30),
    status: 'scheduled',
    type: 'reel',
    caption: 'Behind the scenes look at our creative process ✨ You asked, we delivered!',
    hashtags: ['BTS', 'CreativeProcess', 'BehindTheScenes'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  // Tomorrow
  {
    id: '3',
    title: 'Tips for maximizing productivity in 2024',
    platform: 'linkedin',
    date: createDate(today.getDate() + 1, 8, 0),
    status: 'scheduled',
    type: 'post',
    caption: '5 Tips for maximizing productivity in 2024:\n\n1. Time blocking\n2. Single-tasking\n3. Regular breaks\n4. Morning routines\n5. Digital detox\n\nWhich one will you try first?',
    hashtags: ['Productivity', 'WorkLife', 'CareerTips'],
    accountName: 'Your Name',
    accountHandle: 'Your Name',
  },
  {
    id: '4',
    title: 'Customer success story - How we helped grow their business 3x',
    platform: 'twitter',
    date: createDate(today.getDate() + 1, 12, 0),
    status: 'scheduled',
    type: 'post',
    caption: '🎉 Customer success story: How we helped @exampleclient grow their business 3x in just 6 months. Thread 🧵',
    hashtags: ['CaseStudy', 'Success', 'Growth'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  // Day after tomorrow
  {
    id: '5',
    title: 'Weekend vibes and coffee ☕',
    platform: 'instagram',
    date: createDate(today.getDate() + 2, 9, 0),
    status: 'draft',
    type: 'story',
    caption: 'Weekend vibes and coffee ☕ How are you spending your Saturday?',
    hashtags: ['WeekendVibes', 'Coffee', 'Saturday'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  {
    id: '6',
    title: 'Quick tip: Use keyboard shortcuts to save hours each week',
    platform: 'threads',
    date: createDate(today.getDate() + 2, 11, 0),
    status: 'scheduled',
    type: 'post',
    caption: 'Quick tip: Use keyboard shortcuts to save hours each week ⌨️\n\nMy favorites:\n• Cmd+K - Quick search\n• Cmd+Shift+P - Command palette\n• Cmd+B - Bold text\n\nWhat are yours?',
    hashtags: ['ProductivityTips', 'Shortcuts', 'TechTips'],
    accountName: 'Your Account',
    accountHandle: 'youraccount',
  },
  // Next week content
  {
    id: '7',
    title: 'Introducing our new team member! Welcome aboard 👋',
    platform: 'linkedin',
    date: createDate(today.getDate() + 4, 10, 0),
    status: 'scheduled',
    type: 'post',
    caption: 'Introducing our new team member! Welcome aboard 👋\n\nWe\'re thrilled to have Sarah joining us as our new Head of Product. Her experience in building user-centric products will be invaluable as we scale.',
    hashtags: ['NewHire', 'TeamGrowth', 'Welcome'],
    accountName: 'Your Company',
    accountHandle: 'Your Company',
  },
  {
    id: '8',
    title: 'Flash sale alert! 24 hours only ⚡',
    platform: 'instagram',
    date: createDate(today.getDate() + 5, 9, 0),
    status: 'draft',
    type: 'post',
    caption: '⚡ FLASH SALE ALERT ⚡\n\n24 hours only - Get 30% off everything!\n\nUse code: FLASH30\n\nDon\'t miss out! Link in bio.',
    hashtags: ['Sale', 'FlashSale', 'Discount', 'LimitedTime'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  {
    id: '9',
    title: 'Tutorial: How to create stunning graphics in 5 minutes',
    platform: 'youtube',
    date: createDate(today.getDate() + 5, 14, 0),
    status: 'scheduled',
    type: 'post',
    caption: 'New tutorial is live! Learn how to create stunning graphics in just 5 minutes using our simple techniques.',
    hashtags: ['Tutorial', 'GraphicDesign', 'HowTo'],
    accountName: 'Your Channel',
    accountHandle: '@yourchannel',
  },
  {
    id: '10',
    title: 'Motivation Monday: Start your week strong 💪',
    platform: 'instagram',
    date: createDate(today.getDate() + 7, 6, 0),
    status: 'scheduled',
    type: 'carousel',
    caption: 'Motivation Monday: Start your week strong 💪\n\nSwipe for 5 affirmations to kickstart your week →',
    hashtags: ['MondayMotivation', 'Mindset', 'Success'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  // Earlier this month (published)
  {
    id: '11',
    title: 'Thank you for 10K followers! 🎉',
    platform: 'instagram',
    date: createDate(Math.max(1, today.getDate() - 5), 12, 0),
    status: 'published',
    type: 'post',
    caption: 'Thank you for 10K followers! 🎉 We couldn\'t have done it without your support. Here\'s to the next milestone!',
    hashtags: ['Milestone', 'ThankYou', 'Community'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  {
    id: '12',
    title: 'Q3 results are in - record-breaking quarter!',
    platform: 'linkedin',
    date: createDate(Math.max(1, today.getDate() - 3), 9, 0),
    status: 'published',
    type: 'post',
    caption: 'Q3 results are in and it\'s been our best quarter yet! 📈\n\n• 45% revenue growth\n• 200+ new customers\n• Expanded to 3 new markets\n\nThank you to our incredible team!',
    hashtags: ['Growth', 'Business', 'Startup'],
    accountName: 'Your Company',
    accountHandle: 'Your Company',
  },
  {
    id: '13',
    title: 'Hot take: AI won\'t replace creators, it will empower them',
    platform: 'twitter',
    date: createDate(Math.max(1, today.getDate() - 2), 15, 0),
    status: 'published',
    type: 'post',
    caption: 'Hot take: AI won\'t replace creators, it will empower them.\n\nThe tools are getting better, but human creativity and authenticity will always win.',
    hashtags: ['AI', 'Creators', 'Future'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  // Multiple posts on same day
  {
    id: '14',
    title: 'Morning routine for entrepreneurs',
    platform: 'threads',
    date: createDate(today.getDate() + 3, 7, 0),
    status: 'scheduled',
    type: 'post',
    caption: 'My morning routine as an entrepreneur:\n\n5:30 - Wake up\n5:45 - Workout\n6:30 - Cold shower\n7:00 - Journaling\n7:30 - Deep work\n\nNo phone until 9am. Game changer.',
    hashtags: ['MorningRoutine', 'Entrepreneur', 'Productivity'],
    accountName: 'Your Account',
    accountHandle: 'youraccount',
  },
  {
    id: '15',
    title: 'Exciting partnership announcement coming soon!',
    platform: 'instagram',
    date: createDate(today.getDate() + 3, 12, 0),
    status: 'scheduled',
    type: 'story',
    caption: '👀 Something big is coming... Stay tuned for an exciting partnership announcement!',
    hashtags: ['ComingSoon', 'Partnership', 'Announcement'],
    accountName: 'Your Brand',
    accountHandle: '@yourbrand',
  },
  {
    id: '16',
    title: 'Live Q&A session this Friday!',
    platform: 'facebook',
    date: createDate(today.getDate() + 3, 16, 0),
    status: 'scheduled',
    type: 'post',
    caption: '📣 Live Q&A session this Friday at 3pm EST!\n\nDrop your questions below and we\'ll answer them live. See you there!',
    hashtags: ['LiveQA', 'AskMeAnything', 'Community'],
    accountName: 'Your Page',
    accountHandle: 'Your Page',
  },
];
