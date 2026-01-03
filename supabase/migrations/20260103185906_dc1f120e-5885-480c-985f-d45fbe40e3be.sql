-- Add carousel_images column to social_posts table
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS carousel_images TEXT[] DEFAULT NULL;