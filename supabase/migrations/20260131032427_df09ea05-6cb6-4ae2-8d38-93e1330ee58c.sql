-- Add is_admin_reply column to feedback_comments to distinguish official replies
ALTER TABLE public.feedback_comments 
ADD COLUMN is_admin_reply BOOLEAN NOT NULL DEFAULT false;

-- Create function to notify feedback author when they receive a reply
CREATE OR REPLACE FUNCTION public.notify_feedback_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  feedback_owner_id UUID;
  feedback_title TEXT;
BEGIN
  -- Get the feedback owner and title
  SELECT user_id, title INTO feedback_owner_id, feedback_title
  FROM public.feedback_submissions
  WHERE id = NEW.feedback_id;
  
  -- Only notify if the comment is from someone other than the feedback owner
  IF feedback_owner_id IS NOT NULL AND feedback_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, feedback_id, type, title, message)
    VALUES (
      feedback_owner_id,
      NEW.feedback_id,
      'feedback_reply',
      CASE WHEN NEW.is_admin_reply THEN 'Official Reply Received' ELSE 'New Reply on Your Feedback' END,
      NEW.author_name || ' replied to your feedback: "' || LEFT(feedback_title, 40) || '"'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new comments
CREATE TRIGGER on_feedback_comment_added
AFTER INSERT ON public.feedback_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_feedback_reply();