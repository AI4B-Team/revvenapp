-- Per-task secret minted when a generation job is created and echoed back by the
-- provider in the callback URL, so unauthenticated callbacks cannot forge results.
alter table public.ai_videos add column if not exists callback_token text;
alter table public.generated_images add column if not exists callback_token text;
alter table public.user_voices add column if not exists callback_token text;
alter table public.whitepapers add column if not exists callback_token text;
