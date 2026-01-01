-- Allow users to delete their own story jobs
CREATE POLICY "Users can delete their own story jobs"
ON public.ai_story_jobs
FOR DELETE
USING (auth.uid() = user_id);