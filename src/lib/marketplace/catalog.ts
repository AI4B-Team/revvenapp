import { MarketplaceApp } from './types';

// NOTE: IDs here should match the top-menu tab IDs (see AppTabs.tsx) so "Open" can create a tab.
export const appRoutes: Record<string, string> = {
  create: '/create',
  editor: '/edit',
  sessions: '/sessions',
  'ai-influencer': '/ai-influencer',
  'ai-story': '/ai-story',
  'viral-shorts': '/viral-shorts',
  voiceovers: '/voiceovers',
  'voice-cloner': '/voice-cloner',
  'voice-changer': '/voice-changer',
  transcribe: '/transcribe',
  'audio-dubber': '/audio-dubber',
  'noise-remover': '/noise-remover',
  'background-remover': '/background-remover',
  'image-enhancer': '/image-enhancer',
  'image-upscaler': '/image-upscaler',
  'video-downloader': '/video-downloader',
  'explainer-video': '/explainer-video',
  'ebook-creator': '/ebook-creator',
  'blog-writer': '/blog-writer',
  'social-posts': '/social-posts',
  newsletter: '/newsletter',
  'ad-copy-writer': '/ad-copy-writer',
  'script-writer': '/script-writer',
  'email-generator': '/email-generator',
  'seo-optimizer': '/seo-optimizer',
  'lead-generation': '/lead-generation',
  versus: '/versus',
  forms: '/forms',
  signature: '/signature',
  'ai-responder': '/ai-responder',
  inbox: '/inbox',
  'investor-calculator': '/investor-calculator',
  'digital-spy': '/digital-spy',
  'master-closer': '/master-closer',
  'creator-vault': '/creator-vault',
};

export const appIdByName: Record<string, string> = {
  'REAL Creator': 'create',
  Editor: 'editor',
  Edit: 'editor',
  'AI Voice Cloner': 'voice-cloner',
  'AI Voice Changer': 'voice-changer',
  'AI Voiceovers': 'voiceovers',
  'AI Audio Dubber': 'audio-dubber',
  'AI Noise Remover': 'noise-remover',
  'Job Newsletter': 'newsletter',
  'Ad Copy Writer': 'ad-copy-writer',
  'Script Writer': 'script-writer',
  'Email Generator': 'email-generator',
  'SEO Optimizer': 'seo-optimizer',
  'Video Downloader': 'video-downloader',
  'Explainer Video': 'explainer-video',
  'Image Upscaler': 'image-upscaler',
  'Image Enhancer': 'image-enhancer',
  'Background Remover': 'background-remover',
  'Lead Generation': 'lead-generation',
  'AI Responder': 'ai-responder',
  'Investor Calculator': 'investor-calculator',
  'Digital Spy': 'digital-spy',
  'Creator Vault': 'creator-vault',
};

const catalog: Record<string, MarketplaceApp> = {
  create: {
    id: 'create',
    name: 'REAL Creator',
    description: 'Your all-in-one AI content creation studio.',
    icon: '✨',
    category: 'tools',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Creation workflows', 'Exports', 'Automation-ready'],
  },
  editor: {
    id: 'editor',
    name: 'Editor',
    description: 'Create and edit content with pro-grade tools.',
    icon: '🛠️',
    category: 'tools',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Editing', 'Templates', 'Export'],
  },
  inbox: {
    id: 'inbox',
    name: 'Inbox',
    description: 'Centralize conversations and manage responses.',
    icon: '📥',
    category: 'communication',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Unified inbox', 'Assignments', 'Automation hooks'],
  },
  'investor-calculator': {
    id: 'investor-calculator',
    name: 'Investor Calculator',
    description: 'Analyze deals quickly with investor-friendly metrics.',
    icon: '🏠',
    category: 'real-estate',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Deal analysis', 'Benchmarks', 'Exports'],
  },
  'ai-responder': {
    id: 'ai-responder',
    name: 'AI Responder',
    description: 'Generate fast, on-brand replies with AI assistance.',
    icon: '💬',
    category: 'tools',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Tone controls', 'Knowledge base', 'Auto replies'],
  },
  'digital-spy': {
    id: 'digital-spy',
    name: 'Digital Spy',
    description: 'Content intelligence and insights for your campaigns.',
    icon: '🕵️',
    category: 'content',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Monitoring', 'Insights', 'Reporting'],
  },
  signature: {
    id: 'signature',
    name: 'Signature',
    description: 'Create a polished signature experience.',
    icon: '✍️',
    category: 'tools',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Templates', 'Branding', 'Share'],
  },
  'creator-vault': {
    id: 'creator-vault',
    name: 'Creator Vault',
    description: 'Your curated library of premium content collections.',
    icon: '🗃️',
    category: 'content',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Collections', 'Styles', 'Locations', 'Seasons'],
  },
};

const titleCaseFromId = (id: string) =>
  id
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

export function resolveAppId(name: string) {
  return appIdByName[name] ?? name.toLowerCase().replace(/\s+/g, '-');
}

export function getCatalogApp(appId: string): MarketplaceApp {
  return (
    catalog[appId] ?? {
      id: appId,
      name: titleCaseFromId(appId),
      description: 'Customize And Resell This App Under Your Brand.',
      icon: '🧩',
      category: 'tools',
      isInstallable: true,
      isWhitelabelEligible: true,
      features: [],
    }
  );
}
