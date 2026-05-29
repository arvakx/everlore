CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Sin título',
  logline text NOT NULL DEFAULT '',
  cover_color text NOT NULL DEFAULT '#10B981',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_user_updated ON public.stories(user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own stories" ON public.stories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stories" ON public.stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stories" ON public.stories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own stories" ON public.stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_story_plan_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_plan text;
  v_limit int;
  v_count int;
BEGIN
  SELECT plan INTO v_plan FROM public.profiles WHERE id = NEW.user_id;
  v_limit := CASE COALESCE(v_plan, 'free')
    WHEN 'cronista' THEN 3
    WHEN 'leyenda' THEN 5
    ELSE 1
  END;
  SELECT count(*) INTO v_count FROM public.stories WHERE user_id = NEW.user_id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Plan limit reached: % of % stories', v_count, v_limit USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$func$;

CREATE TRIGGER stories_plan_limit BEFORE INSERT ON public.stories FOR EACH ROW EXECUTE FUNCTION public.enforce_story_plan_limit();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$;

CREATE TRIGGER stories_touch_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();