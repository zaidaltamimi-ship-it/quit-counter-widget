
-- Friend invitations table
CREATE TABLE public.friend_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations they sent"
  ON public.friend_invitations FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view invitations sent to their email"
  ON public.friend_invitations FOR SELECT
  USING (
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations"
  ON public.friend_invitations FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update invitations sent to them"
  ON public.friend_invitations FOR UPDATE
  USING (
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE TRIGGER update_friend_invitations_updated_at
  BEFORE UPDATE ON public.friend_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_a, user_b)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can update their friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can delete their friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  friendship_id UUID NOT NULL REFERENCES public.friendships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'encouragement', 'milestone_share')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check friendship membership
CREATE OR REPLACE FUNCTION public.is_friendship_member(_user_id UUID, _friendship_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE id = _friendship_id AND (user_a = _user_id OR user_b = _user_id)
  )
$$;

CREATE POLICY "Users can view messages in their friendships"
  ON public.messages FOR SELECT
  USING (public.is_friendship_member(auth.uid(), friendship_id));

CREATE POLICY "Users can send messages in their friendships"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND public.is_friendship_member(auth.uid(), friendship_id));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Allow users to view profiles of their friends
CREATE POLICY "Users can view friend profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (user_a = auth.uid() AND user_b = profiles.user_id)
         OR (user_b = auth.uid() AND user_a = profiles.user_id)
    )
  );

-- Allow viewing friend addiction progress (read-only)
CREATE POLICY "Users can view friend addictions"
  ON public.addictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'active'
        AND ((user_a = auth.uid() AND user_b = addictions.user_id)
          OR (user_b = auth.uid() AND user_a = addictions.user_id))
    )
  );
