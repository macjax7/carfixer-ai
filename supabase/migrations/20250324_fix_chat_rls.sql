
-- Enable Row Level Security on chat tables
ALTER TABLE IF EXISTS public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

DROP POLICY IF EXISTS "Users can view messages from their chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages in their chat sessions" ON public.chat_messages;

-- Create policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages from their chat sessions"
  ON public.chat_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their chat sessions"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their chat sessions"
  ON public.chat_messages
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their chat sessions"
  ON public.chat_messages
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update chat_sessions.updated_at when a new message is added
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions 
  SET updated_at = NOW() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_chat_session_on_message ON public.chat_messages;

-- Create trigger
CREATE TRIGGER update_chat_session_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_session_timestamp();
