-- Add admin policies for user_voices table
CREATE POLICY "Admins can view all audio" 
ON public.user_voices 
FOR SELECT 
USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete all audio" 
ON public.user_voices 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));