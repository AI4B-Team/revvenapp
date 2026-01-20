-- Create a table for dynamic apps registry
CREATE TABLE public.app_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Apps',
  icon_url TEXT,
  bg_color TEXT NOT NULL DEFAULT 'bg-tool-blue',
  route TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_new BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_tools ENABLE ROW LEVEL SECURITY;

-- Allow public read access (apps are visible to everyone)
CREATE POLICY "Apps are publicly readable" 
ON public.app_tools 
FOR SELECT 
USING (true);

-- Only admins can modify apps
CREATE POLICY "Admins can manage apps" 
ON public.app_tools 
FOR ALL 
USING (public.is_admin_or_moderator(auth.uid()));

-- Add timestamp trigger
CREATE TRIGGER update_app_tools_updated_at
BEFORE UPDATE ON public.app_tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial apps data
INSERT INTO public.app_tools (name, description, category, bg_color, route, sort_order, is_new) VALUES
-- Apps category
('Website Builder', 'Build custom websites', 'Apps', 'bg-tool-blue', '/websites', 1, false),
('Landing Page', 'Create landing pages', 'Apps', 'bg-tool-yellow', '/websites', 2, false),
('Form Builder', 'Design custom forms', 'Apps', 'bg-tool-green', '/forms', 3, false),
('Chat Bot', 'Build AI chatbots', 'Apps', 'bg-tool-blue', '/chatbot', 4, false),
('API Builder', 'Create custom APIs', 'Apps', 'bg-tool-pink', '/api-builder', 5, false),
('Automation Flow', 'Build workflows', 'Apps', 'bg-tool-yellow', '/automation', 6, false),
('AI Story', 'Generate AI stories', 'Apps', 'bg-tool-purple', '/ai-story', 7, false),
('Lead Generation', 'Generate leads from platforms', 'Apps', 'bg-tool-green', '/lead-generation', 8, false),
('Master Closer', 'AI sales co-pilot', 'Apps', 'bg-tool-purple', '/master-closer', 9, true),

-- Image category
('Art Blocks', 'AI create some art works', 'Image', 'bg-tool-blue', NULL, 1, false),
('Edit', 'Edit images with AI', 'Image', 'bg-tool-green', NULL, 2, false),
('Background Remover', 'Remove backgrounds', 'Image', 'bg-tool-yellow', '/background-remover', 3, false),
('Image Eraser', 'Erase parts of images', 'Image', 'bg-tool-pink', '/image-eraser', 4, false),
('Image Upscaler', 'Enhance image resolution', 'Image', 'bg-tool-blue', '/image-upscaler', 5, false),
('Image Enhancer', 'Improve image quality', 'Image', 'bg-tool-purple', '/image-enhancer', 6, false),
('Image Colorizer', 'Colorize B&W images', 'Image', 'bg-tool-green', '/image-colorizer', 7, false),

-- Video category
('Sessions', 'Video recording sessions', 'Video', 'bg-tool-blue', '/sessions', 1, false),
('Video Downloader', 'Download videos', 'Video', 'bg-tool-yellow', '/video-downloader', 2, false),
('Video Resizer', 'Resize video dimensions', 'Video', 'bg-tool-purple', '/video-resizer', 3, false),
('Motion-Sync', 'Sync motion to videos', 'Video', 'bg-tool-pink', '/motion-sync', 4, false),
('Explainer Video', 'Create explainer videos', 'Video', 'bg-tool-blue', '/explainer-video', 5, false),
('AI Influencer', 'Create AI influencer videos', 'Video', 'bg-tool-purple', '/ai-influencer', 6, false),
('Viral Shorts', 'Create viral short videos', 'Video', 'bg-tool-green', '/viral-shorts', 7, false),
('Auto Post', 'Auto post to YouTube', 'Video', 'bg-tool-yellow', '/auto-post', 8, false),
('Infinity Talk', 'Create infinite conversations', 'Video', 'bg-tool-pink', '/infinity-talk', 9, false),

-- Audio category
('Voice Cloner', 'Clone any voice', 'Audio', 'bg-tool-blue', '/voice-cloner', 1, false),
('Transcribe', 'Transcribe audio to text', 'Audio', 'bg-tool-green', '/transcribe', 2, false),
('Voice Changer', 'Change voice effects', 'Audio', 'bg-tool-yellow', '/voice-changer', 3, false),
('Voiceovers', 'Create voiceovers', 'Audio', 'bg-tool-purple', '/voiceovers', 4, false),
('Audio Dubber', 'Dub audio content', 'Audio', 'bg-tool-pink', '/audio-dubber', 5, false),
('Noise Remover', 'Remove background noise', 'Audio', 'bg-tool-blue', '/noise-remover', 6, false),

-- Design category
('Logo Designer', 'Design custom logos', 'Design', 'bg-tool-purple', '/logo-designer', 1, false),
('Banner Creator', 'Create banners', 'Design', 'bg-tool-blue', '/banner-creator', 2, false),
('Flyer Maker', 'Design flyers', 'Design', 'bg-tool-green', '/flyer-maker', 3, false),
('Poster Designer', 'Create posters', 'Design', 'bg-tool-yellow', '/poster-designer', 4, false),
('Infographic Builder', 'Build infographics', 'Design', 'bg-tool-pink', '/infographic-builder', 5, false),
('Presentation Maker', 'Create presentations', 'Design', 'bg-tool-purple', '/presentation-maker', 6, false),

-- Content category
('Blog Writer', 'Write blog posts', 'Content', 'bg-tool-blue', '/blog-writer', 1, false),
('Social Posts', 'Create social content', 'Content', 'bg-tool-yellow', '/social-posts', 2, false),
('Email Generator', 'Generate emails', 'Content', 'bg-tool-green', '/email-generator', 3, false),
('Ad Copy Writer', 'Write ad copy', 'Content', 'bg-tool-purple', '/ad-copy-writer', 4, false),
('Script Writer', 'Write scripts', 'Content', 'bg-tool-pink', '/script-writer', 5, false),
('SEO Optimizer', 'Optimize for SEO', 'Content', 'bg-tool-blue', '/seo-optimizer', 6, false),
('Ebook Creator', 'Create ebooks', 'Content', 'bg-tool-green', '/ebook-creator', 7, false),
('Newsletter', 'Create newsletters', 'Content', 'bg-tool-yellow', '/newsletter', 8, false);