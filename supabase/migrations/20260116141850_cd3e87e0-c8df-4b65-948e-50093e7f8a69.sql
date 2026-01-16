-- Add session_id column to track separate chat sessions
ALTER TABLE public.aiva_chat_messages 
ADD COLUMN session_id UUID DEFAULT gen_random_uuid();

-- Create index for faster session queries
CREATE INDEX idx_aiva_chat_messages_session_id ON public.aiva_chat_messages(session_id);