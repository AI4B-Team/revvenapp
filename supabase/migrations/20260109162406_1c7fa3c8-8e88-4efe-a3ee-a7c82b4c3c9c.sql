-- Fix Security Issues: Secure RLS Policies

-- 1. FIX invite_codes - Remove public SELECT, only allow checking code validity without exposing PII
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can check invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Service can update invite codes" ON public.invite_codes;

-- Create a secure policy that only allows authenticated users to see their own created codes
CREATE POLICY "Users can view their own created invite codes"
ON public.invite_codes
FOR SELECT
TO authenticated
USING (auth.uid() = creator_user_id);

-- Create a policy for checking if a code exists (without exposing user data)
-- This uses a security definer function instead

-- Create function to check if invite code is valid (without exposing data)
CREATE OR REPLACE FUNCTION public.check_invite_code(code_to_check text)
RETURNS TABLE(is_valid boolean, is_used boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS(SELECT 1 FROM invite_codes WHERE code = code_to_check) as is_valid,
    COALESCE((SELECT ic.is_used FROM invite_codes ic WHERE code = code_to_check LIMIT 1), false) as is_used
$$;

-- Create function to redeem invite code (security definer)
CREATE OR REPLACE FUNCTION public.redeem_invite_code(
  code_to_redeem text,
  redeemer_email text,
  redeemer_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_exists boolean;
  already_used boolean;
BEGIN
  -- Check if code exists and is not used
  SELECT EXISTS(SELECT 1 FROM invite_codes WHERE code = code_to_redeem), 
         COALESCE((SELECT is_used FROM invite_codes WHERE code = code_to_redeem LIMIT 1), true)
  INTO code_exists, already_used;
  
  IF NOT code_exists THEN
    RETURN false;
  END IF;
  
  IF already_used THEN
    RETURN false;
  END IF;
  
  -- Mark code as used
  UPDATE invite_codes 
  SET is_used = true, 
      used_at = now(), 
      used_by_email = redeemer_email, 
      used_by_name = redeemer_name,
      used_by_user_id = auth.uid()
  WHERE code = code_to_redeem AND is_used = false;
  
  RETURN true;
END;
$$;

-- 2. FIX newsletter_subscribers - Restrict access, only admins can view all
DROP POLICY IF EXISTS "Anyone can check their subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.newsletter_subscribers;

-- Create secure function for newsletter subscription (no direct table access)
CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(subscriber_email text, subscriber_name text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO newsletter_subscribers (email, name, status)
  VALUES (subscriber_email, subscriber_name, 'subscribed')
  ON CONFLICT (email) DO UPDATE SET status = 'subscribed', updated_at = now();
  RETURN true;
END;
$$;

-- Create secure function to check subscription status
CREATE OR REPLACE FUNCTION public.check_newsletter_subscription(check_email text)
RETURNS TABLE(is_subscribed boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT status = 'subscribed' FROM newsletter_subscribers WHERE email = check_email LIMIT 1), false) as is_subscribed
$$;

-- Create secure function to unsubscribe
CREATE OR REPLACE FUNCTION public.unsubscribe_from_newsletter(unsub_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_subscribers 
  SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
  WHERE email = unsub_email;
  RETURN true;
END;
$$;

-- Only admins can view newsletter subscribers
CREATE POLICY "Admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. FIX lead_generation_history - Restrict to authenticated users only
DROP POLICY IF EXISTS "Public can delete lead_generation_history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Public can insert lead_generation_history" ON public.lead_generation_history;
DROP POLICY IF EXISTS "Public can read lead_generation_history" ON public.lead_generation_history;

-- Users can only see their own lead generation history
CREATE POLICY "Users can view their own lead generation history"
ON public.lead_generation_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lead generation history"
ON public.lead_generation_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead generation history"
ON public.lead_generation_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all lead generation history
CREATE POLICY "Admins can view all lead generation history"
ON public.lead_generation_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. FIX ai_story_jobs - Replace overly permissive service update policy
DROP POLICY IF EXISTS "Service role can update story jobs" ON public.ai_story_jobs;

-- Users can update their own story jobs
CREATE POLICY "Users can update their own story jobs"
ON public.ai_story_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create a security definer function for backend updates
CREATE OR REPLACE FUNCTION public.update_story_job_status(
  job_id uuid,
  new_status text,
  new_video_url text DEFAULT NULL,
  new_error_message text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ai_story_jobs 
  SET 
    status = new_status,
    video_url = COALESCE(new_video_url, video_url),
    error_message = new_error_message,
    updated_at = now(),
    completed_at = CASE WHEN new_status IN ('completed', 'failed') THEN now() ELSE completed_at END
  WHERE id = job_id;
  RETURN true;
END;
$$;