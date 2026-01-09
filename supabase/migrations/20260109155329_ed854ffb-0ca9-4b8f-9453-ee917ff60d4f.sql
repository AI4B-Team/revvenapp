-- Add auto_publish column to social_posts table
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN NOT NULL DEFAULT true;

-- Add index for efficient querying of posts to publish
CREATE INDEX IF NOT EXISTS idx_social_posts_auto_publish_scheduled 
ON public.social_posts (scheduled_date, status, auto_publish) 
WHERE auto_publish = true AND status = 'scheduled';

-- Enable pg_cron and pg_net extensions for scheduled function calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;