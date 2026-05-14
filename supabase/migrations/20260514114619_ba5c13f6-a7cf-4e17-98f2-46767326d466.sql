-- Allow users to delete invitations they sent
CREATE POLICY "Users can delete invitations they sent"
ON public.friend_invitations
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);
