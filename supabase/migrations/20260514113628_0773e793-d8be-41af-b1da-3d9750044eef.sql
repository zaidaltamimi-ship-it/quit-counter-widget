CREATE OR REPLACE FUNCTION public.get_my_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON public.friend_invitations;
DROP POLICY IF EXISTS "Users can update invitations sent to them" ON public.friend_invitations;

CREATE POLICY "Users can view invitations sent to their email"
ON public.friend_invitations FOR SELECT
USING (recipient_email = public.get_my_email());

CREATE POLICY "Users can update invitations sent to them"
ON public.friend_invitations FOR UPDATE
USING (recipient_email = public.get_my_email());