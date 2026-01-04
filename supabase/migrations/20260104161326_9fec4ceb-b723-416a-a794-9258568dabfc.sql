-- Add admin policies for ai_videos table so admins can view and manage all videos
CREATE POLICY "Admins can view all videos" 
ON public.ai_videos 
FOR SELECT 
USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete all videos" 
ON public.ai_videos 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));