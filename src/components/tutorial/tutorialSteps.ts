// Tutorial steps for different sections of the app

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon?: string; // Lucide icon name
}

export const createPageTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome To Create!',
    description: 'This Is Your Creative Hub Where You Can Generate Amazing AI-Powered Content Including Images, Videos, Documents, And More. Let\'s Take A Quick Tour!',
    icon: 'Palette',
  },
  {
    id: 'categories',
    title: 'Content Categories',
    description: 'Use The Tabs At The Top To Switch Between Different Content Types: All Creations, Images, Videos, Audio, And Documents. Each Category Has Unique AI Tools.',
    icon: 'LayoutGrid',
  },
  {
    id: 'ai-tools',
    title: 'AI Creation Tools',
    description: 'Click On Any Tool Card To Start Creating. Each Tool Is Powered By Advanced AI To Help You Generate Professional Content In Seconds.',
    icon: 'Wand2',
  },
  {
    id: 'gallery',
    title: 'Your Creations Gallery',
    description: 'All Your Generated Content Appears In The Gallery Below. You Can View, Download, Share, Or Delete Your Creations Anytime.',
    icon: 'Images',
  },
  {
    id: 'aiva',
    title: 'Meet AIVA - Your AI Assistant',
    description: 'Click The AIVA Button In The Bottom Corner To Chat With Your AI Assistant. AIVA Can Help You With Ideas, Answer Questions, And Guide You Through The Creation Process.',
    icon: 'MessageCircle',
  },
];

export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-welcome',
    title: 'Welcome To Your Dashboard!',
    description: 'This Is Your Home Base Where You Can See An Overview Of Your Activity, Quick Stats, And Access All The Main Features Of The App.',
    icon: 'BarChart3',
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description: 'Use The Sidebar On The Left To Navigate Between Different Sections: Dashboard, Create, Apps, Calendar, Analytics, And Settings.',
    icon: 'PanelLeft',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'The Dashboard Shows Your Recent Creations And Provides Quick Access To Frequently Used Tools. Click Any Card To Jump Right In!',
    icon: 'Zap',
  },
  {
    id: 'stats',
    title: 'Your Stats',
    description: 'Track Your Content Performance With Real-Time Analytics Showing Views, Engagement, And Content Created Over Time.',
    icon: 'TrendingUp',
  },
];

export const appsPageTutorialSteps: TutorialStep[] = [
  {
    id: 'apps-welcome',
    title: 'Welcome To Apps!',
    description: 'Discover A Collection Of Specialized AI-Powered Tools Designed To Help You With Specific Tasks Like Lead Generation, Social Media, And More.',
    icon: 'Rocket',
  },
  {
    id: 'app-categories',
    title: 'Browse By Category',
    description: 'Apps Are Organized Into Categories To Help You Find The Right Tool Quickly. From Content Creation To Analytics, There\'s An App For Everything.',
    icon: 'FolderOpen',
  },
  {
    id: 'app-details',
    title: 'Using Apps',
    description: 'Click On Any App Card To Open It. Each App Has Its Own Interface Tailored To Its Specific Purpose. Some Apps Are Marked As "New" - Try Them Out!',
    icon: 'MousePointerClick',
  },
];

export const calendarTutorialSteps: TutorialStep[] = [
  {
    id: 'calendar-welcome',
    title: 'Welcome To Calendar!',
    description: 'Plan And Schedule Your Content With The Visual Calendar. See All Your Upcoming Posts And Manage Your Content Schedule In One Place.',
    icon: 'CalendarDays',
  },
  {
    id: 'calendar-views',
    title: 'Calendar Views',
    description: 'Switch Between Month, Week, And Day Views To See Your Scheduled Content At Different Levels Of Detail.',
    icon: 'LayoutDashboard',
  },
  {
    id: 'schedule-post',
    title: 'Scheduling Content',
    description: 'Click On Any Date To Schedule New Content Or Drag Existing Posts To Reschedule Them. Your Content Will Be Automatically Published At The Scheduled Time.',
    icon: 'Clock',
  },
];

export const brandWizardTutorialSteps: TutorialStep[] = [
  {
    id: 'brand-welcome',
    title: 'Welcome To Brand Setup!',
    description: 'Create A Comprehensive Brand Profile To Ensure All Your AI-Generated Content Matches Your Brand\'s Unique Identity And Voice.',
    icon: 'Sparkles',
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    description: 'Start By Uploading Your Logo And Setting Your Brand Colors And Fonts. This Visual Identity Will Be Applied Across All Your Generated Content.',
    icon: 'Fingerprint',
  },
  {
    id: 'brand-voice',
    title: 'Brand Voice',
    description: 'Define Your Tone Of Voice, Writing Style, And Communication Guidelines. The AI Will Use These To Match Your Brand\'s Personality.',
    icon: 'Mic',
  },
  {
    id: 'brand-knowledge',
    title: 'Knowledge Base',
    description: 'Upload Documents And Add Data Sources To Teach The AI About Your Products, Services, And Industry-Specific Information.',
    icon: 'BookOpen',
  },
  {
    id: 'brand-complete',
    title: 'Complete Your Profile',
    description: 'Once You\'ve Filled In All Sections, Your Brand Profile Will Power Personalized Content Generation Across The Entire Platform.',
    icon: 'CheckCircle',
  },
];

export const whiteLabelTutorialSteps: TutorialStep[] = [
  {
    id: 'whitelabel-welcome',
    title: 'Welcome To Page Builder!',
    description: 'Create A Stunning Custom Landing Page For Your Brand. Customize Every Section To Match Your Style And Message.',
    icon: 'Target',
  },
  {
    id: 'whitelabel-sections',
    title: 'Page Sections',
    description: 'Your Page Is Built From Modular Sections: Hero, Features, Testimonials, Pricing, And More. Enable Or Disable Sections As Needed.',
    icon: 'Layers',
  },
  {
    id: 'whitelabel-customize',
    title: 'Customization',
    description: 'Click On Any Section To Customize Its Content, Colors, And Layout. See Your Changes Instantly In The Live Preview.',
    icon: 'Paintbrush',
  },
  {
    id: 'whitelabel-preview',
    title: 'Live Preview',
    description: 'Toggle Between Mobile And Desktop Views To Ensure Your Page Looks Great On All Devices.',
    icon: 'Eye',
  },
  {
    id: 'whitelabel-publish',
    title: 'Publish Your Page',
    description: 'When You\'re Happy With Your Design, Click Publish To Make Your Landing Page Live And Share It With The World!',
    icon: 'Globe',
  },
];