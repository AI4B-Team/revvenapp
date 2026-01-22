// Import all app tool icons
import toolWebsiteBuilder from '@/assets/icons/tool-website-builder.png';
import toolLandingPage from '@/assets/icons/tool-landing-page.png';
import toolFormBuilder from '@/assets/icons/tool-form-builder.png';
import toolChatbot from '@/assets/icons/tool-chatbot.png';
import toolApiBuilder from '@/assets/icons/tool-api-builder.png';
import toolAutomationFlow from '@/assets/icons/tool-automation-flow.png';
import toolAiStory from '@/assets/icons/tool-ai-story.png';
import toolLeadGeneration from '@/assets/icons/tool-lead-generation.png';
import toolMasterCloser from '@/assets/icons/tool-master-closer.png';
import toolAiResponder from '@/assets/icons/tool-ai-responder.png';
import toolInbox from '@/assets/icons/tool-inbox.png';
import toolInvestorCalculator from '@/assets/icons/investor-calculator-icon.png';

// Import image tool icons
import toolArtBlocks from '@/assets/icons/tool-art-blocks.png';
import toolEdit from '@/assets/icons/tool-edit.png';
import toolBackgroundRemover from '@/assets/icons/tool-background-remover.png';
import toolImageEraser from '@/assets/icons/tool-image-eraser.png';
import toolImageUpscaler from '@/assets/icons/tool-image-upscaler.png';
import toolImageEnhancer from '@/assets/icons/tool-image-enhancer.png';
import toolImageColorizer from '@/assets/icons/tool-image-colorizer.png';

// Import video tool icons
import toolSessions from '@/assets/icons/tool-sessions.png';
import toolVideoDownloader from '@/assets/icons/tool-video-downloader.png';
import toolVideoResizer from '@/assets/icons/tool-video-resizer.png';
import toolMotionSync from '@/assets/icons/tool-motion-sync.png';
import toolExplainerVideo from '@/assets/icons/tool-explainer-video.png';
import toolAiInfluencer from '@/assets/icons/tool-ai-influencer.png';
import toolViralShorts from '@/assets/icons/tool-viral-shorts.png';
import toolAutoPost from '@/assets/icons/tool-auto-post.png';
import toolInfinityTalk from '@/assets/icons/tool-infinity-talk.png';

// Import audio tool icons
import toolVoiceCloner from '@/assets/icons/tool-voice-cloner.png';
import toolTranscribe from '@/assets/icons/tool-transcribe.png';
import toolVoiceChanger from '@/assets/icons/tool-voice-changer.png';
import toolVoiceovers from '@/assets/icons/tool-voiceovers.png';
import toolAudioDubber from '@/assets/icons/tool-audio-dubber.png';
import toolNoiseRemover from '@/assets/icons/tool-noise-remover.png';

// Import design tool icons
import toolLogoDesigner from '@/assets/icons/tool-logo-designer.png';
import toolBannerCreator from '@/assets/icons/tool-banner-creator.png';
import toolFlyerMaker from '@/assets/icons/tool-flyer-maker.png';
import toolPosterDesigner from '@/assets/icons/tool-poster-designer.png';
import toolInfographicBuilder from '@/assets/icons/tool-infographic-builder.png';
import toolPresentationMaker from '@/assets/icons/tool-presentation-maker.png';

// Import content tool icons
import toolBlogWriter from '@/assets/icons/tool-blog-writer.png';
import toolSocialPosts from '@/assets/icons/tool-social-posts.png';
import toolEmailGenerator from '@/assets/icons/tool-email-generator.png';
import toolAdCopyWriter from '@/assets/icons/tool-ad-copy-writer.png';
import toolScriptWriter from '@/assets/icons/tool-script-writer.png';
import toolSeoOptimizer from '@/assets/icons/tool-seo-optimizer.png';
import toolEbookCreator from '@/assets/icons/tool-ebook-creator.png';
import toolJobNewsletter from '@/assets/icons/tool-job-newsletter.png';

// Map app names to their icons
export const appIconMapping: Record<string, string> = {
  // Apps
  'Website Builder': toolWebsiteBuilder,
  'Landing Page': toolLandingPage,
  'Form Builder': toolFormBuilder,
  'Chat Bot': toolChatbot,
  'AI Responder': toolAiResponder,
  'API Builder': toolApiBuilder,
  'Automation Flow': toolAutomationFlow,
  'AI Story': toolAiStory,
  'Lead Generation': toolLeadGeneration,
  'Master Closer': toolMasterCloser,
  'Inbox': toolInbox,
  'Investor Calculator': toolInvestorCalculator,
  
  // Image
  'Art Blocks': toolArtBlocks,
  'Edit': toolEdit,
  'Background Remover': toolBackgroundRemover,
  'Image Eraser': toolImageEraser,
  'Image Upscaler': toolImageUpscaler,
  'Image Enhancer': toolImageEnhancer,
  'Image Colorizer': toolImageColorizer,
  
  // Video
  'Sessions': toolSessions,
  'Video Downloader': toolVideoDownloader,
  'Video Resizer': toolVideoResizer,
  'Motion-Sync': toolMotionSync,
  'Explainer Video': toolExplainerVideo,
  'AI Influencer': toolAiInfluencer,
  'Viral Shorts': toolViralShorts,
  'Auto Post': toolAutoPost,
  'Infinity Talk': toolInfinityTalk,
  
  // Audio
  'Voice Cloner': toolVoiceCloner,
  'Transcribe': toolTranscribe,
  'Voice Changer': toolVoiceChanger,
  'Voiceovers': toolVoiceovers,
  'Audio Dubber': toolAudioDubber,
  'Noise Remover': toolNoiseRemover,
  
  // Design
  'Logo Designer': toolLogoDesigner,
  'Banner Creator': toolBannerCreator,
  'Flyer Maker': toolFlyerMaker,
  'Poster Designer': toolPosterDesigner,
  'Infographic Builder': toolInfographicBuilder,
  'Presentation Maker': toolPresentationMaker,
  
  // Content
  'Blog Writer': toolBlogWriter,
  'Social Posts': toolSocialPosts,
  'Email Generator': toolEmailGenerator,
  'Ad Copy Writer': toolAdCopyWriter,
  'Script Writer': toolScriptWriter,
  'SEO Optimizer': toolSeoOptimizer,
  'Ebook Creator': toolEbookCreator,
  'Newsletter': toolJobNewsletter,
};

export const getAppIcon = (name: string): string | undefined => {
  return appIconMapping[name];
};
