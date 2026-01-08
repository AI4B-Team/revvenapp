-- Enable realtime for autoyt_videos table
ALTER TABLE public.autoyt_videos REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.autoyt_videos;