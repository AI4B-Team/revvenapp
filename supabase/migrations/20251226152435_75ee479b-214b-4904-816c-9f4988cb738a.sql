-- Store transcript text per "section" (segment) so edits persist across refresh without re-splitting
CREATE TABLE IF NOT EXISTS public.transcript_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id uuid NOT NULL,
  user_id uuid NOT NULL,
  segment_index integer NOT NULL,
  speaker text NOT NULL DEFAULT 'Speaker 1',
  start_time text NOT NULL DEFAULT '00:00',
  end_time text,
  text text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS transcript_segments_unique_idx
  ON public.transcript_segments (transcript_id, segment_index);

CREATE INDEX IF NOT EXISTS transcript_segments_transcript_id_idx
  ON public.transcript_segments (transcript_id);

ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transcript segments"
  ON public.transcript_segments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their transcript segments"
  ON public.transcript_segments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their transcript segments"
  ON public.transcript_segments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their transcript segments"
  ON public.transcript_segments
  FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_transcript_segments_updated_at ON public.transcript_segments;
CREATE TRIGGER update_transcript_segments_updated_at
  BEFORE UPDATE ON public.transcript_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
