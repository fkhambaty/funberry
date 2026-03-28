-- Allow authenticated clients (parent session on /play) to run star increments after games.
GRANT EXECUTE ON FUNCTION public.increment_stars(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_stars(UUID, INTEGER) TO service_role;
