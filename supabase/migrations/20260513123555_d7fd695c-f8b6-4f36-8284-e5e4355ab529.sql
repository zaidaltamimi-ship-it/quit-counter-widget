
ALTER TABLE public.addictions
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS total_paused_ms bigint NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.slips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addiction_id uuid NOT NULL REFERENCES public.addictions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL DEFAULT 'continue',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select their slips" ON public.slips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their slips" ON public.slips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their slips" ON public.slips FOR DELETE USING (auth.uid() = user_id);
