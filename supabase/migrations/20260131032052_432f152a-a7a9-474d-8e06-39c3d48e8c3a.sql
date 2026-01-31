-- Create notifications table for feedback progress updates
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feedback_id UUID REFERENCES public.feedback_submissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'feedback_update',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create function to notify feedback author on status change
CREATE OR REPLACE FUNCTION public.notify_feedback_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, feedback_id, type, title, message)
    VALUES (
      NEW.user_id,
      NEW.id,
      'feedback_update',
      'Feedback Status Updated',
      'Your feedback "' || LEFT(NEW.title, 50) || '" status changed to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for status changes
CREATE TRIGGER on_feedback_status_change
AFTER UPDATE ON public.feedback_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_feedback_status_change();