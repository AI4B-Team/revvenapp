import React, { useState } from 'react';
import { InstallModal } from '@/components/marketplace/InstallModal';
import { mockTeams } from '@/lib/marketplace/data';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { getCatalogApp } from '@/lib/marketplace/catalog';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import { useAppReviews } from '@/hooks/useAppReviews';
import { mockMembers, mockMarketplaceWorkspace, mockMarketplaceUser } from '@/lib/marketplace/data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  Download, 
  DollarSign, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Zap,
  Users,
  Clock,
  Check,
  ExternalLink,
  X,
  Send,
  Trash2
} from 'lucide-react';
import { appRoutes } from '@/lib/marketplace/catalog';
import { getAppThumbnail } from '@/utils/appThumbnails';

// Mock screenshots for apps - in production these would come from the catalog
const getAppScreenshots = (appId: string): { src: string; title: string }[] => {
  // Generate placeholder screenshots based on app ID
  const colors = ['4F46E5', '059669', 'DC2626', 'D97706', '7C3AED', '2563EB', '0891B2', 'BE185D'];
  return [
    { src: `https://placehold.co/800x500/${colors[0]}/white?text=${encodeURIComponent('Dashboard View')}`, title: 'Dashboard View' },
    { src: `https://placehold.co/800x500/${colors[1]}/white?text=${encodeURIComponent('Editor Interface')}`, title: 'Editor Interface' },
    { src: `https://placehold.co/800x500/${colors[2]}/white?text=${encodeURIComponent('Analytics')}`, title: 'Analytics' },
    { src: `https://placehold.co/800x500/${colors[3]}/white?text=${encodeURIComponent('Settings')}`, title: 'Settings' },
    { src: `https://placehold.co/800x500/${colors[4]}/white?text=${encodeURIComponent('Team View')}`, title: 'Team View' },
    { src: `https://placehold.co/800x500/${colors[5]}/white?text=${encodeURIComponent('Reports')}`, title: 'Reports' },
    { src: `https://placehold.co/800x500/${colors[6]}/white?text=${encodeURIComponent('Integrations')}`, title: 'Integrations' },
    { src: `https://placehold.co/800x500/${colors[7]}/white?text=${encodeURIComponent('Notifications')}`, title: 'Notifications' },
  ];
};

// App-specific features with descriptions
const getExtendedFeatures = (appId: string) => {
  const appFeatures: Record<string, { icon: typeof Zap; title: string; description: string }[]> = {
    'master-closer': [
      { icon: Zap, title: 'AI Sales Scripts', description: 'Generate persuasive, customized closing scripts for any product or service in seconds.' },
      { icon: Shield, title: 'Objection Handling', description: 'Smart responses to common objections with proven techniques that convert hesitant prospects.' },
      { icon: Users, title: 'CRM Integration', description: 'Seamlessly connect with your existing CRM to track deals and automate follow-ups.' },
      { icon: Clock, title: 'Real-Time Coaching', description: 'Get live suggestions during calls to improve your pitch and close more deals.' },
    ],
    'creator-vault': [
      { icon: Zap, title: 'Curated Collections', description: 'Access premium, organized content libraries for instant creative inspiration.' },
      { icon: Shield, title: 'License Management', description: 'Track usage rights and licenses for all your assets in one place.' },
      { icon: Users, title: 'Team Sharing', description: 'Collaborate with your team by sharing collections and assets securely.' },
      { icon: Clock, title: 'Quick Search', description: 'Find any asset instantly with powerful tags, filters, and AI-powered search.' },
    ],
    'viral-shorts': [
      { icon: Zap, title: 'Trending Templates', description: 'Use viral-ready templates optimized for TikTok, Reels, and YouTube Shorts.' },
      { icon: Shield, title: 'Auto-Captions', description: 'Generate engaging captions and hashtags that boost discoverability.' },
      { icon: Users, title: 'Multi-Platform Export', description: 'Export in perfect dimensions for every major social platform simultaneously.' },
      { icon: Clock, title: 'AI Script Generator', description: 'Create scroll-stopping hooks and scripts based on trending content patterns.' },
    ],
    'digital-influencer': [
      { icon: Zap, title: 'AI Avatar Creation', description: 'Generate realistic AI influencers with customizable appearance and personality.' },
      { icon: Shield, title: 'Content Automation', description: 'Schedule and auto-generate posts, stories, and videos for your AI persona.' },
      { icon: Users, title: 'Audience Analytics', description: 'Track engagement, growth metrics, and audience insights in real-time.' },
      { icon: Clock, title: 'Voice Cloning', description: 'Create authentic voiceovers that match your AI influencer\'s personality.' },
    ],
    'ai-influencer': [
      { icon: Zap, title: 'AI Avatar Creation', description: 'Generate realistic AI influencers with customizable appearance and personality.' },
      { icon: Shield, title: 'Content Automation', description: 'Schedule and auto-generate posts, stories, and videos for your AI persona.' },
      { icon: Users, title: 'Audience Analytics', description: 'Track engagement, growth metrics, and audience insights in real-time.' },
      { icon: Clock, title: 'Voice Cloning', description: 'Create authentic voiceovers that match your AI influencer\'s personality.' },
    ],
    'digital-spy': [
      { icon: Zap, title: 'Competitor Tracking', description: 'Monitor competitor content, engagement, and posting strategies automatically.' },
      { icon: Shield, title: 'Trend Detection', description: 'Get alerted to emerging trends before they peak so you can capitalize early.' },
      { icon: Users, title: 'Content Analysis', description: 'Deep-dive into what makes viral content work with AI-powered insights.' },
      { icon: Clock, title: 'Report Generation', description: 'Create comprehensive competitive intelligence reports in one click.' },
    ],
    'transcribe': [
      { icon: Zap, title: '99% Accuracy', description: 'Industry-leading speech recognition with support for multiple accents and languages.' },
      { icon: Shield, title: 'Speaker Detection', description: 'Automatically identify and label different speakers in conversations.' },
      { icon: Users, title: 'Team Annotations', description: 'Add comments, highlights, and notes collaboratively on transcripts.' },
      { icon: Clock, title: 'Instant Export', description: 'Export to multiple formats including SRT, VTT, PDF, and Word documents.' },
    ],
    'editor': [
      { icon: Zap, title: 'Multi-Track Timeline', description: 'Professional editing with unlimited video, audio, and image tracks.' },
      { icon: Shield, title: 'AI Enhancements', description: 'One-click color correction, noise removal, and quality upscaling.' },
      { icon: Users, title: 'Cloud Projects', description: 'Access your projects from anywhere with automatic cloud sync and backup.' },
      { icon: Clock, title: 'Fast Rendering', description: 'GPU-accelerated exports with support for 4K and higher resolutions.' },
    ],
    'ai-responder': [
      { icon: Zap, title: 'Instant Replies', description: 'Auto-generate contextual responses to messages, comments, and emails.' },
      { icon: Shield, title: 'Brand Voice', description: 'Train the AI to match your unique tone, style, and messaging guidelines.' },
      { icon: Users, title: 'Multi-Channel', description: 'Connect to email, social media, and messaging apps from one dashboard.' },
      { icon: Clock, title: 'Smart Queuing', description: 'Prioritize and schedule responses based on urgency and importance.' },
    ],
    'investor-calculator': [
      { icon: Zap, title: 'Deal Analysis', description: 'Instantly calculate ROI, cash flow, and profitability for any property deal.' },
      { icon: Shield, title: 'Risk Assessment', description: 'Evaluate market conditions and identify potential risks before investing.' },
      { icon: Users, title: 'Shareable Reports', description: 'Generate professional investor-ready reports to share with partners.' },
      { icon: Clock, title: 'Market Comparables', description: 'Access real-time data on comparable properties and market trends.' },
    ],
    'create': [
      { icon: Zap, title: 'AI Content Studio', description: 'Generate images, videos, and text content with state-of-the-art AI models.' },
      { icon: Shield, title: 'Brand Consistency', description: 'Maintain your brand identity across all generated content automatically.' },
      { icon: Users, title: 'Team Workflows', description: 'Collaborate on content creation with approval flows and shared templates.' },
      { icon: Clock, title: 'Batch Generation', description: 'Create multiple pieces of content simultaneously to save hours of work.' },
    ],
    'sessions': [
      { icon: Zap, title: 'Live Recording', description: 'Capture high-quality video and audio sessions with one-click recording.' },
      { icon: Shield, title: 'Secure Storage', description: 'All recordings are encrypted and stored securely in the cloud.' },
      { icon: Users, title: 'Session Sharing', description: 'Share recordings with team members or clients via secure links.' },
      { icon: Clock, title: 'Auto-Transcription', description: 'Get instant transcriptions of your sessions with speaker identification.' },
    ],
    'ai-story': [
      { icon: Zap, title: 'Story Generation', description: 'Create compelling narratives with AI-powered story writing assistance.' },
      { icon: Shield, title: 'Plot Templates', description: 'Use proven story structures and templates for any genre or format.' },
      { icon: Users, title: 'Character Builder', description: 'Develop rich, consistent characters with AI-guided backstories.' },
      { icon: Clock, title: 'Scene Expansion', description: 'Expand brief ideas into fully-fleshed scenes with vivid descriptions.' },
    ],
    'voiceovers': [
      { icon: Zap, title: 'Natural Voices', description: 'Access 100+ ultra-realistic AI voices in multiple languages and accents.' },
      { icon: Shield, title: 'Emotion Control', description: 'Adjust tone, pace, and emotion to match your content perfectly.' },
      { icon: Users, title: 'Project Library', description: 'Organize all your voiceover projects with easy search and filtering.' },
      { icon: Clock, title: 'Instant Generation', description: 'Generate professional voiceovers in seconds, not hours.' },
    ],
    'voice-cloner': [
      { icon: Zap, title: 'Voice Cloning', description: 'Create a perfect digital clone of any voice from just a few minutes of audio.' },
      { icon: Shield, title: 'Voice Security', description: 'Your voice models are private and securely stored with encryption.' },
      { icon: Users, title: 'Multi-Voice Projects', description: 'Use multiple cloned voices in a single project for dynamic content.' },
      { icon: Clock, title: 'Real-Time Synthesis', description: 'Generate speech instantly with your cloned voice model.' },
    ],
    'voice-changer': [
      { icon: Zap, title: 'Voice Transformation', description: 'Transform your voice in real-time with dozens of voice presets.' },
      { icon: Shield, title: 'Privacy Mode', description: 'Anonymize your voice for secure communications and content.' },
      { icon: Users, title: 'Character Voices', description: 'Create unique character voices for games, videos, or podcasts.' },
      { icon: Clock, title: 'Live Processing', description: 'Use voice effects during live streams or video calls.' },
    ],
    'audio-dubber': [
      { icon: Zap, title: 'AI Dubbing', description: 'Automatically dub videos into multiple languages with AI voice matching.' },
      { icon: Shield, title: 'Lip-Sync Technology', description: 'Advanced lip-syncing that matches the original speaker\'s movements.' },
      { icon: Users, title: 'Multi-Language Export', description: 'Export your video in multiple languages simultaneously.' },
      { icon: Clock, title: 'Fast Processing', description: 'Dub hours of content in minutes with parallel processing.' },
    ],
    'noise-remover': [
      { icon: Zap, title: 'AI Noise Removal', description: 'Remove background noise, echo, and hum with one-click AI processing.' },
      { icon: Shield, title: 'Voice Enhancement', description: 'Boost voice clarity while preserving natural audio quality.' },
      { icon: Users, title: 'Batch Processing', description: 'Clean multiple audio files at once for large projects.' },
      { icon: Clock, title: 'Real-Time Preview', description: 'Hear the cleaned audio instantly before exporting.' },
    ],
    'background-remover': [
      { icon: Zap, title: 'AI Background Removal', description: 'Remove backgrounds from images instantly with precision AI detection.' },
      { icon: Shield, title: 'Edge Refinement', description: 'Smart edge detection for clean, professional cutouts every time.' },
      { icon: Users, title: 'Bulk Processing', description: 'Process hundreds of images at once for e-commerce or marketing.' },
      { icon: Clock, title: 'Custom Backgrounds', description: 'Replace backgrounds with solid colors, gradients, or custom images.' },
    ],
    'image-enhancer': [
      { icon: Zap, title: 'AI Enhancement', description: 'Automatically enhance colors, contrast, and sharpness with AI.' },
      { icon: Shield, title: 'Face Enhancement', description: 'Improve facial features while maintaining natural appearance.' },
      { icon: Users, title: 'Preset Library', description: 'Access professional enhancement presets for various styles.' },
      { icon: Clock, title: 'One-Click Fixes', description: 'Fix common issues like red-eye, blur, and noise instantly.' },
    ],
    'image-upscaler': [
      { icon: Zap, title: '4x Upscaling', description: 'Upscale images up to 4x resolution without losing quality.' },
      { icon: Shield, title: 'Detail Recovery', description: 'AI reconstructs fine details that were lost in compression.' },
      { icon: Users, title: 'Batch Upscaling', description: 'Upscale entire folders of images in one go.' },
      { icon: Clock, title: 'Format Support', description: 'Support for all major image formats including RAW files.' },
    ],
    'video-downloader': [
      { icon: Zap, title: 'Multi-Platform Support', description: 'Download videos from YouTube, Vimeo, and 100+ other platforms.' },
      { icon: Shield, title: 'Quality Selection', description: 'Choose your preferred resolution up to 4K and HDR.' },
      { icon: Users, title: 'Playlist Downloads', description: 'Download entire playlists or channels with one click.' },
      { icon: Clock, title: 'Audio Extraction', description: 'Extract audio tracks from videos in MP3 or other formats.' },
    ],
    'explainer-video': [
      { icon: Zap, title: 'AI Video Creation', description: 'Create professional explainer videos from text scripts automatically.' },
      { icon: Shield, title: 'Template Library', description: 'Choose from hundreds of professional explainer video templates.' },
      { icon: Users, title: 'Brand Customization', description: 'Apply your brand colors, logos, and fonts consistently.' },
      { icon: Clock, title: 'Auto-Animation', description: 'AI automatically animates scenes based on your script.' },
    ],
    'ebook-creator': [
      { icon: Zap, title: 'AI Writing Assistant', description: 'Generate chapters, outlines, and content with AI assistance.' },
      { icon: Shield, title: 'Professional Templates', description: 'Use beautifully designed templates for any book genre.' },
      { icon: Users, title: 'Collaboration Tools', description: 'Work with editors and co-authors in real-time.' },
      { icon: Clock, title: 'Multi-Format Export', description: 'Export to EPUB, PDF, MOBI, and print-ready formats.' },
    ],
    'blog-writer': [
      { icon: Zap, title: 'AI Blog Generation', description: 'Generate SEO-optimized blog posts from topics or outlines.' },
      { icon: Shield, title: 'Plagiarism Check', description: 'Ensure all content is original with built-in plagiarism detection.' },
      { icon: Users, title: 'Content Calendar', description: 'Plan and schedule your blog content in advance.' },
      { icon: Clock, title: 'SEO Optimization', description: 'Automatic keyword optimization and meta tag generation.' },
    ],
    'social-posts': [
      { icon: Zap, title: 'AI Post Generator', description: 'Create engaging social media posts for any platform instantly.' },
      { icon: Shield, title: 'Hashtag Research', description: 'AI-suggested hashtags based on trending topics and engagement.' },
      { icon: Users, title: 'Multi-Platform Posting', description: 'Schedule and post to all your social accounts at once.' },
      { icon: Clock, title: 'Engagement Analytics', description: 'Track performance across all platforms in one dashboard.' },
    ],
    'newsletter': [
      { icon: Zap, title: 'AI Newsletter Writing', description: 'Generate compelling newsletter content with AI assistance.' },
      { icon: Shield, title: 'Template Designer', description: 'Create beautiful, responsive email templates with drag-and-drop.' },
      { icon: Users, title: 'Subscriber Management', description: 'Manage your subscriber list with segmentation and analytics.' },
      { icon: Clock, title: 'Automation Flows', description: 'Set up automated welcome series and nurture campaigns.' },
    ],
    'ad-copy-writer': [
      { icon: Zap, title: 'AI Ad Copy', description: 'Generate high-converting ad copy for any platform or product.' },
      { icon: Shield, title: 'A/B Testing Variants', description: 'Create multiple ad variations for split testing campaigns.' },
      { icon: Users, title: 'Platform Optimization', description: 'Copy optimized for Facebook, Google, LinkedIn, and more.' },
      { icon: Clock, title: 'Headline Generator', description: 'Generate dozens of compelling headlines in seconds.' },
    ],
    'script-writer': [
      { icon: Zap, title: 'AI Script Writing', description: 'Generate video scripts, podcast outlines, and dialogue with AI.' },
      { icon: Shield, title: 'Format Templates', description: 'Industry-standard formats for films, YouTube, ads, and podcasts.' },
      { icon: Users, title: 'Collaboration Mode', description: 'Work with writing partners in real-time with change tracking.' },
      { icon: Clock, title: 'Scene Breakdown', description: 'Automatic scene breakdown with timing estimates.' },
    ],
    'email-generator': [
      { icon: Zap, title: 'AI Email Writing', description: 'Generate professional emails for any situation in seconds.' },
      { icon: Shield, title: 'Tone Adjustment', description: 'Switch between formal, casual, persuasive, and other tones.' },
      { icon: Users, title: 'Template Library', description: 'Access hundreds of email templates for common scenarios.' },
      { icon: Clock, title: 'Follow-Up Sequences', description: 'Create automated follow-up email sequences.' },
    ],
    'seo-optimizer': [
      { icon: Zap, title: 'AI SEO Analysis', description: 'Get instant SEO recommendations for any webpage or content.' },
      { icon: Shield, title: 'Keyword Research', description: 'Discover high-value keywords with search volume and competition data.' },
      { icon: Users, title: 'Competitor Analysis', description: 'Analyze competitor SEO strategies and find opportunities.' },
      { icon: Clock, title: 'Rank Tracking', description: 'Monitor your search rankings across keywords over time.' },
    ],
    'lead-generation': [
      { icon: Zap, title: 'AI Lead Finder', description: 'Find and verify leads from multiple sources automatically.' },
      { icon: Shield, title: 'Data Enrichment', description: 'Enrich lead data with company info, social profiles, and more.' },
      { icon: Users, title: 'CRM Integration', description: 'Sync leads directly to your CRM with custom field mapping.' },
      { icon: Clock, title: 'Email Verification', description: 'Verify email addresses to ensure high deliverability.' },
    ],
    'versus': [
      { icon: Zap, title: 'Comparison Generator', description: 'Create detailed product comparisons automatically with AI.' },
      { icon: Shield, title: 'Feature Matrix', description: 'Generate side-by-side feature comparison tables instantly.' },
      { icon: Users, title: 'Review Aggregation', description: 'Aggregate reviews and ratings from multiple sources.' },
      { icon: Clock, title: 'Decision Helper', description: 'AI-powered recommendations based on user preferences.' },
    ],
    'forms': [
      { icon: Zap, title: 'Drag-Drop Builder', description: 'Build beautiful forms with an intuitive drag-and-drop interface.' },
      { icon: Shield, title: 'Conditional Logic', description: 'Create smart forms that adapt based on user responses.' },
      { icon: Users, title: 'Response Management', description: 'View, filter, and export form responses with analytics.' },
      { icon: Clock, title: 'Integrations', description: 'Connect to 100+ apps including CRMs, email tools, and more.' },
    ],
    'signature': [
      { icon: Zap, title: 'Email Signature Builder', description: 'Create professional email signatures with templates and branding.' },
      { icon: Shield, title: 'Brand Consistency', description: 'Ensure all team members use consistent, branded signatures.' },
      { icon: Users, title: 'Team Management', description: 'Manage and deploy signatures across your entire organization.' },
      { icon: Clock, title: 'Analytics', description: 'Track clicks on links and banners in your signatures.' },
    ],
    'inbox': [
      { icon: Zap, title: 'Unified Inbox', description: 'Manage all your messages from email, social, and chat in one place.' },
      { icon: Shield, title: 'Smart Filtering', description: 'AI-powered filters to prioritize important messages automatically.' },
      { icon: Users, title: 'Team Assignments', description: 'Assign conversations to team members with tracking.' },
      { icon: Clock, title: 'Canned Responses', description: 'Save and use templates for common responses.' },
    ],
    'ghost-ink': [
      { icon: Zap, title: 'AI Ghostwriting', description: 'Professional ghostwriting for articles, blogs, and books.' },
      { icon: Shield, title: 'Voice Matching', description: 'AI learns and matches your unique writing style and voice.' },
      { icon: Users, title: 'Research Assistant', description: 'Built-in research tools to gather facts and citations.' },
      { icon: Clock, title: 'Long-Form Content', description: 'Generate comprehensive long-form content effortlessly.' },
    ],
    'agents': [
      { icon: Zap, title: 'AI Agent Builder', description: 'Create custom AI agents for automation and customer service.' },
      { icon: Shield, title: 'Knowledge Training', description: 'Train agents on your data for accurate, contextual responses.' },
      { icon: Users, title: 'Multi-Channel Deploy', description: 'Deploy agents to web, chat, email, and phone channels.' },
      { icon: Clock, title: 'Analytics Dashboard', description: 'Track agent performance, conversations, and outcomes.' },
    ],
    'resizer': [
      { icon: Zap, title: 'Smart Resize', description: 'Resize images for any platform with AI-powered smart cropping.' },
      { icon: Shield, title: 'Preset Dimensions', description: 'Pre-configured sizes for all major social media platforms.' },
      { icon: Users, title: 'Batch Processing', description: 'Resize hundreds of images simultaneously.' },
      { icon: Clock, title: 'Quality Preservation', description: 'Maintain image quality while resizing with AI enhancement.' },
    ],
  };

  // Default features for apps without specific features defined
  const defaultFeatures = [
    { icon: Zap, title: 'Lightning Fast', description: 'Optimized performance with instant load times and smooth interactions.' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-level encryption and compliance with industry standards.' },
    { icon: Users, title: 'Team Collaboration', description: 'Work together seamlessly with real-time updates and shared workspaces.' },
    { icon: Clock, title: 'Auto-Save', description: 'Never lose your work with automatic cloud saving and version history.' },
  ];

  return appFeatures[appId] || defaultFeatures;
};

const AppStorePage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [screenshotStartIndex, setScreenshotStartIndex] = useState(0);
  const [showInstallPanel, setShowInstallPanel] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['all']);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { isInstalled, installApp } = useInstalledApps();
  const { 
    reviews, 
    isLoading: isLoadingReviews, 
    userReview, 
    user,
    submitReview, 
    deleteReview,
    totalReviews,
    averageRating,
    ratingDistribution
  } = useAppReviews(appId);
  
  const app = appId ? getCatalogApp(appId) : undefined;
  const screenshots = appId ? getAppScreenshots(appId) : [];
  const extendedFeatures = appId ? getExtendedFeatures(appId) : [];
  const installed = appId ? isInstalled(appId) : false;
  const appRoute = appId ? appRoutes[appId] : undefined;
  
  const visibleCount = 4; // Number of screenshots visible at once

  // Mock users for access control
  const accessUsers = [
    { id: 'all', name: 'Everyone In This Workspace' },
    { id: 'brian', name: 'Brian' },
    { id: 'francis', name: 'Francis' },
    { id: 'rich', name: 'Rich' },
    { id: 'damoi', name: 'Damoi' },
    { id: 'keisha', name: 'Keisha' },
  ];

  const handleInstall = () => {
    if (!appId) return;
    
    const hasAll = selectedUserIds.includes('all');
    const accessMode = hasAll ? 'all_members' : 'select_users';
    const userIds = hasAll ? [] : selectedUserIds;
    
    installApp(
      appId,
      mockMarketplaceWorkspace.id,
      mockMarketplaceUser.id,
      accessMode as any,
      userIds,
      []
    );
    toast.success(`${app?.name} installed successfully!`);
    setShowInstallPanel(false);
  };

  const toggleUserSelection = (userId: string) => {
    if (userId === 'all') {
      // If selecting "all", clear other selections
      setSelectedUserIds(['all']);
    } else {
      setSelectedUserIds(prev => {
        // Remove 'all' if it was selected
        const withoutAll = prev.filter(id => id !== 'all');
        if (prev.includes(userId)) {
          // Remove user if already selected
          const newSelection = withoutAll.filter(id => id !== userId);
          // If no users selected, default to 'all'
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          // Add user to selection
          return [...withoutAll, userId];
        }
      });
    }
  };

  const handleResell = () => {
    if (appId) {
      navigate(`/app-license/${appId}`);
    }
  };

  const handleOpen = () => {
    if (appRoute) {
      navigate(appRoute);
    }
  };

  const canScrollLeft = screenshotStartIndex > 0;
  const canScrollRight = screenshotStartIndex + visibleCount < screenshots.length;

  const scrollScreenshotsLeft = () => {
    if (canScrollLeft) {
      setScreenshotStartIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollScreenshotsRight = () => {
    if (canScrollRight) {
      setScreenshotStartIndex(prev => Math.min(screenshots.length - visibleCount, prev + 1));
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      toast.error('Please write a review');
      return;
    }
    setIsSubmittingReview(true);
    const success = await submitReview(reviewRating, reviewTitle, reviewContent);
    if (success) {
      setReviewTitle('');
      setReviewContent('');
      setReviewRating(5);
      setShowReviewForm(false);
    }
    setIsSubmittingReview(false);
  };

  const handleDeleteReview = async () => {
    if (confirm('Are you sure you want to delete your review?')) {
      await deleteReview();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!app) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground text-lg">App not found</p>
              <Button onClick={() => navigate('/apps')} variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Back to Apps
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Back Button and Action Buttons Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/apps')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back To Apps
              </button>
              
              {/* Action Buttons - Top Right */}
              <div className="flex flex-wrap gap-3">
                {installed ? (
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleOpen}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setShowInstallPanel(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleResell}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Resell
                </Button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
              {/* App Icon & Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-muted/50 border border-border shadow-lg overflow-hidden">
                  {getAppThumbnail(app.name) ? (
                    <img src={getAppThumbnail(app.name)} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">{app.icon}</div>
                  )}
                </div>
              </div>

              {/* App Details */}
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{app.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{app.description}</p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="capitalize">{app.category}</Badge>
                    {app.isWhitelabelEligible && (
                      <Badge className="bg-primary/10 text-primary border-0">White-Label Ready</Badge>
                    )}
                    {installed && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Installed
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= 4.5 ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                        />
                      ))}
                      <span className="ml-2 font-semibold text-foreground">4.8</span>
                    </div>
                    <span className="text-muted-foreground">2.4K Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Install Panel */}
            {showInstallPanel && (
              <div className="mb-8 p-6 bg-muted/50 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Who Should Have Access?</h3>
                <div className="space-y-3">
                  {accessUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUserIds.includes(user.id)
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-background border border-transparent hover:bg-muted'
                      }`}
                    >
                      <input
                        type={user.id === 'all' ? 'radio' : 'checkbox'}
                        name="access-user"
                        value={user.id}
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary rounded"
                      />
                      <span className="text-foreground font-medium">{user.name}</span>
                    </label>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>NOTE:</strong> You can change access permissions later from the app settings.
                  </p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowInstallPanel(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleInstall}
                  >
                    Install App
                  </Button>
                </div>
              </div>
            )}

            {/* Screenshots Carousel - 4 in a row */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">Screenshots</h2>
              <div className="relative">
                {/* Left Arrow */}
                <button
                  onClick={scrollScreenshotsLeft}
                  disabled={!canScrollLeft}
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background border border-border shadow-lg transition-all ${
                    canScrollLeft 
                      ? 'hover:bg-muted cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                
                {/* Screenshots Grid */}
                <div className="overflow-hidden">
                  <div className="grid grid-cols-4 gap-4">
                    {screenshots.slice(screenshotStartIndex, screenshotStartIndex + visibleCount).map((screenshot, index) => (
                      <div 
                        key={screenshotStartIndex + index}
                        onClick={() => openLightbox(screenshotStartIndex + index)}
                        className="relative aspect-video rounded-xl border border-border overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                      >
                        <img
                          src={screenshot.src}
                          alt={screenshot.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">{screenshot.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Arrow */}
                <button
                  onClick={scrollScreenshotsRight}
                  disabled={!canScrollRight}
                  className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background border border-border shadow-lg transition-all ${
                    canScrollRight 
                      ? 'hover:bg-muted cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
              
              {/* Indicator dots */}
              <div className="flex gap-2 mt-4 justify-center">
                {Array.from({ length: screenshots.length - visibleCount + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setScreenshotStartIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === screenshotStartIndex 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
                <div className="relative">
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  
                  <img
                    src={screenshots[lightboxIndex]?.src}
                    alt={screenshots[lightboxIndex]?.title}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  
                  {/* Lightbox Navigation */}
                  <button
                    onClick={lightboxPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={lightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  
                  {/* Caption */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-medium">{screenshots[lightboxIndex]?.title}</span>
                    <span className="text-white/60 ml-2">({lightboxIndex + 1} of {screenshots.length})</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Features Grid */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Features from catalog */}
                {app.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{feature}</span>
                  </div>
                ))}
                
                {/* Extended Features */}
                {extendedFeatures.map((feature, index) => (
                  <div 
                    key={`ext-${index}`}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">About This App</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {app.name} is a powerful tool designed to streamline your workflow and boost productivity. 
                  Built with cutting-edge technology, it offers a seamless experience across all devices.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Whether you're a solo creator or part of a large team, {app.name} adapts to your needs 
                  with its flexible configuration options and intuitive interface. The white-label capability 
                  allows you to customize the experience for your clients, making it perfect for agencies 
                  and resellers.
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Reviews & Ratings</h2>
                {user && !userReview && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    Write A Review
                  </Button>
                )}
              </div>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-8 mb-6 p-6 bg-muted/50 rounded-2xl border border-border">
                <div className="text-center">
                  <div className="text-5xl font-bold text-foreground">
                    {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  {ratingDistribution.map(({ rating, percentage }) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-4">{rating}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              {showReviewForm && user && (
                <div className="mb-6 p-6 bg-muted/50 rounded-2xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Write Your Review</h3>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 cursor-pointer transition-colors ${
                              star <= reviewRating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-muted hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    placeholder="Review title (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="mb-3"
                  />
                  
                  <Textarea
                    placeholder="Share your experience with this app..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="mb-4 min-h-[100px]"
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || !reviewContent.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* User's Existing Review */}
              {userReview && (
                <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {getInitials(userReview.author_name)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {userReview.author_name}
                          <Badge variant="secondary" className="text-xs">Your Review</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(userReview.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= userReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteReview}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {userReview.title && <h4 className="font-medium text-foreground mb-1">{userReview.title}</h4>}
                  <p className="text-sm text-muted-foreground">{userReview.content}</p>
                </div>
              )}
              
              {/* Individual Reviews */}
              <div className="space-y-4">
                {isLoadingReviews ? (
                  <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
                ) : reviews.filter(r => r.id !== userReview?.id).length === 0 && !userReview ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. {user ? 'Be the first to leave a review!' : 'Log in to leave a review.'}
                  </div>
                ) : (
                  reviews.filter(r => r.id !== userReview?.id).map((review) => (
                    <div key={review.id} className="p-4 bg-background rounded-xl border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {getInitials(review.author_name)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{review.author_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && <h4 className="font-medium text-foreground mb-1">{review.title}</h4>}
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* App Info Footer */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium text-foreground capitalize">{app.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                  <div className="font-medium text-foreground">Jan 20, 2026</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Developer</div>
                  <div className="font-medium text-foreground">REVVEN Inc.</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">White-Label</div>
                  <div className="font-medium text-foreground">{app.isWhitelabelEligible ? 'Available' : 'Not Available'}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppStorePage;
