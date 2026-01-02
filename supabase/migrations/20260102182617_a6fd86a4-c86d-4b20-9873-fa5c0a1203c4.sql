-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Allow public delete from lead_generation_history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Allow public insert to lead_generation_history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Allow public read access to lead_generation_history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Anyone can delete lead generation history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Anyone can insert lead generation history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Anyone can view lead generation history" ON public.lead_generation_history;

-- Create new PERMISSIVE policies (default behavior)
CREATE POLICY "Public can read lead_generation_history"
ON public.lead_generation_history
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can insert lead_generation_history"
ON public.lead_generation_history
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can delete lead_generation_history"
ON public.lead_generation_history
FOR DELETE
TO public
USING (true);