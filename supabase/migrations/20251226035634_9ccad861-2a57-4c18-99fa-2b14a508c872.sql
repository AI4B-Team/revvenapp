-- Create table for text-level highlights
CREATE TABLE public.transcript_highlights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id uuid NOT NULL,
    user_id uuid NOT NULL,
    segment_index integer NOT NULL,
    start_pos integer NOT NULL,
    end_pos integer NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transcript_highlights ENABLE ROW LEVEL SECURITY;

-- Collaborator access: owner + users who share the same workspace with the transcript owner could access in the future.
-- For now just user-level (owner).
CREATE POLICY "Users can view highlights on their transcripts"
    ON public.transcript_highlights FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert highlights on their transcripts"
    ON public.transcript_highlights FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their highlights"
    ON public.transcript_highlights FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their highlights"
    ON public.transcript_highlights FOR DELETE
    USING (user_id = auth.uid());

-- Create table for comments (with replies stored as JSONB for simplicity)
CREATE TABLE public.transcript_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id uuid NOT NULL,
    user_id uuid NOT NULL,
    segment_index integer NOT NULL,
    text text NOT NULL,
    author text NOT NULL DEFAULT 'You',
    resolved boolean NOT NULL DEFAULT false,
    mentions text[] DEFAULT '{}',
    replies jsonb DEFAULT '[]',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.transcript_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their transcripts"
    ON public.transcript_comments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert comments on their transcripts"
    ON public.transcript_comments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their comments"
    ON public.transcript_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their comments"
    ON public.transcript_comments FOR DELETE
    USING (user_id = auth.uid());

-- Trigger to update updated_at on transcript_comments changes
CREATE TRIGGER update_transcript_comments_updated_at
    BEFORE UPDATE ON public.transcript_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();