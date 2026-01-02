-- Add RLS policy to allow all users to read lead_generation_history
-- Since user_id is optional and can be null, we allow public read access

CREATE POLICY "Allow public read access to lead_generation_history"
ON public.lead_generation_history
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to lead_generation_history"
ON public.lead_generation_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public delete from lead_generation_history"
ON public.lead_generation_history
FOR DELETE
USING (true);