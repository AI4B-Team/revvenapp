
-- 1. investor_deals: remove overly broad "Anyone can view shared deals" policy and expose a safe view instead
DROP POLICY IF EXISTS "Anyone can view shared deals" ON public.investor_deals;

CREATE OR REPLACE VIEW public.shared_investor_deals AS
SELECT id, share_token, created_at, updated_at
FROM public.investor_deals
WHERE share_token IS NOT NULL;

GRANT SELECT ON public.shared_investor_deals TO anon, authenticated;

-- 2. notifications: restrict INSERT
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert any notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. project-thumbnails storage: scope update/delete/insert to owner folder
DROP POLICY IF EXISTS "Users can update their thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload project thumbnails" ON storage.objects;

CREATE POLICY "Users can upload own project thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-thumbnails'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own project thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-thumbnails'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own project thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-thumbnails'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Public bucket listing restriction: replace overly broad public SELECT on project-thumbnails
-- Keep individual file reads possible (bucket is public via CDN), but require ownership to list via API
DROP POLICY IF EXISTS "Public can view project thumbnails" ON storage.objects;

CREATE POLICY "Owners can list own project thumbnails"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-thumbnails'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 5. realtime.messages: add restrictive policies scoped to authenticated user's topic
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users receive own topic messages" ON realtime.messages;
CREATE POLICY "Authenticated users receive own topic messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE ('%' || (auth.uid())::text || '%')
);

DROP POLICY IF EXISTS "Authenticated users send own topic messages" ON realtime.messages;
CREATE POLICY "Authenticated users send own topic messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE ('%' || (auth.uid())::text || '%')
);

-- 6. SECURITY DEFINER functions: revoke EXECUTE from anon/authenticated on internal trigger + admin helpers
REVOKE EXECUTE ON FUNCTION public.update_feedback_comments_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_community_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_feedback_votes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_feedback_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_feedback_reply() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_story_job_status(uuid, text, text, text) FROM PUBLIC, anon, authenticated;

-- Keep newsletter helpers callable by anon (public signup/check/unsub flows)
-- Keep has_role/is_admin_or_moderator/get_user_role callable by authenticated
-- Restrict invite code helpers to authenticated only
REVOKE EXECUTE ON FUNCTION public.check_invite_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_invite_code(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_invite_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_moderator(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_moderator(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
