
-- Sharing settings per addiction
CREATE TABLE public.addiction_sharing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addiction_id uuid NOT NULL UNIQUE REFERENCES public.addictions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  share_type boolean NOT NULL DEFAULT true,
  share_quit_date boolean NOT NULL DEFAULT true,
  share_per_day boolean NOT NULL DEFAULT false,
  share_savings boolean NOT NULL DEFAULT false,
  share_mood boolean NOT NULL DEFAULT false,
  share_health boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addiction_sharing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own sharing settings"
  ON public.addiction_sharing FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Friends can view sharing settings"
  ON public.addiction_sharing FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'active'
      AND ((user_a = auth.uid() AND user_b = addiction_sharing.user_id)
        OR (user_b = auth.uid() AND user_a = addiction_sharing.user_id))
  ));

CREATE TRIGGER update_addiction_sharing_updated_at
  BEFORE UPDATE ON public.addiction_sharing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create sharing row when an addiction is created
CREATE OR REPLACE FUNCTION public.create_addiction_sharing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.addiction_sharing (addiction_id, user_id)
  VALUES (NEW.id, NEW.user_id)
  ON CONFLICT (addiction_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_addiction_sharing_on_insert
  AFTER INSERT ON public.addictions
  FOR EACH ROW EXECUTE FUNCTION public.create_addiction_sharing();

-- Backfill for existing addictions
INSERT INTO public.addiction_sharing (addiction_id, user_id)
SELECT id, user_id FROM public.addictions
ON CONFLICT (addiction_id) DO NOTHING;

-- Helper: check sharing flag for a friend
CREATE OR REPLACE FUNCTION public.friend_can_see(_viewer uuid, _owner uuid, _flag text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_friend boolean;
  flag_value boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'active'
      AND ((user_a = _viewer AND user_b = _owner)
        OR (user_b = _viewer AND user_a = _owner))
  ) INTO is_friend;

  IF NOT is_friend THEN RETURN false; END IF;

  EXECUTE format('SELECT bool_or(%I) FROM public.addiction_sharing WHERE user_id = $1', _flag)
    USING _owner INTO flag_value;
  RETURN COALESCE(flag_value, false);
END;
$$;

-- Replace friend visibility on addictions to honor share_type
DROP POLICY IF EXISTS "Users can view friend addictions" ON public.addictions;

CREATE POLICY "Friends can view shared addictions"
  ON public.addictions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.friendships f
    JOIN public.addiction_sharing s ON s.addiction_id = addictions.id
    WHERE f.status = 'active'
      AND s.share_type = true
      AND ((f.user_a = auth.uid() AND f.user_b = addictions.user_id)
        OR (f.user_b = auth.uid() AND f.user_a = addictions.user_id))
  ));

-- Friends can view health entries only if share_health = true on that addiction
CREATE POLICY "Friends can view shared health entries"
  ON public.health_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.friendships f
    JOIN public.addiction_sharing s ON s.addiction_id = health_entries.addiction_id
    WHERE f.status = 'active'
      AND s.share_health = true
      AND ((f.user_a = auth.uid() AND f.user_b = health_entries.user_id)
        OR (f.user_b = auth.uid() AND f.user_a = health_entries.user_id))
  ));

CREATE POLICY "Friends can view shared mood entries"
  ON public.mood_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.friendships f
    JOIN public.addiction_sharing s ON s.addiction_id = mood_entries.addiction_id
    WHERE f.status = 'active'
      AND s.share_mood = true
      AND ((f.user_a = auth.uid() AND f.user_b = mood_entries.user_id)
        OR (f.user_b = auth.uid() AND f.user_a = mood_entries.user_id))
  ));
