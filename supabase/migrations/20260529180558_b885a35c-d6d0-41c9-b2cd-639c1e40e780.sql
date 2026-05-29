ALTER FUNCTION public.touch_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.enforce_story_plan_limit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_story_plan_limit() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_story_plan_limit() FROM authenticated;