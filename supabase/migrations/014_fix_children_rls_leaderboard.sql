-- Fix critical RLS hole: migration 007 added children_leaderboard_read with
-- FOR SELECT USING (authenticated), which ORs with the parent policy and exposes
-- every child row to any logged-in parent.
--
-- Replace global child reads with SECURITY DEFINER RPCs that:
-- - Only return other players' stars + anonymized labels (no foreign child ids/names/photos).
-- - Return full row details only for the caller's own children.

DROP POLICY IF EXISTS children_leaderboard_read ON public.children;

-- Rank among all kids with stars > 0; caller must own p_child_id.
CREATE OR REPLACE FUNCTION public.get_child_star_rank(p_child_id uuid)
RETURNS TABLE(rank bigint, total bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stars integer;
BEGIN
  SELECT c.total_stars INTO v_stars
  FROM public.children c
  WHERE c.id = p_child_id AND c.parent_id = auth.uid();

  IF v_stars IS NULL OR v_stars <= 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    (1 + (
      SELECT count(*)::bigint
      FROM public.children x
      WHERE x.total_stars > v_stars
    )) AS rank,
    (SELECT count(*)::bigint FROM public.children y WHERE y.total_stars > 0) AS total;
END;
$$;

COMMENT ON FUNCTION public.get_child_star_rank(uuid) IS
  'Global star rank for a child; only works when auth.uid() is the parent. Used instead of broad SELECT on children.';

-- Top star earners: anonymized for other families; full id/name/photo only for caller's kids.
CREATE OR REPLACE FUNCTION public.leaderboard_top_stars(p_limit integer DEFAULT 50)
RETURNS TABLE(
  rank bigint,
  child_id uuid,
  total_stars integer,
  display_name text,
  photo_url text,
  is_mine boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lim AS (
    SELECT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)::bigint AS n
  ),
  top_slice AS (
    SELECT c.id, c.parent_id, c.name, c.photo_url, c.total_stars
    FROM public.children c, lim
    WHERE c.total_stars > 0
    ORDER BY c.total_stars DESC, c.id
    LIMIT (SELECT n FROM lim)
  )
  SELECT
    row_number() OVER (ORDER BY t.total_stars DESC, t.id)::bigint AS rank,
    CASE WHEN t.parent_id = auth.uid() THEN t.id ELSE NULL END AS child_id,
    t.total_stars,
    CASE WHEN t.parent_id = auth.uid() THEN t.name ELSE 'Star learner'::text END AS display_name,
    CASE WHEN t.parent_id = auth.uid() THEN t.photo_url ELSE NULL::text END AS photo_url,
    (t.parent_id = auth.uid()) AS is_mine
  FROM top_slice t;
$$;

COMMENT ON FUNCTION public.leaderboard_top_stars(integer) IS
  'Leaderboard rows: own children fully identified; everyone else anonymized.';

REVOKE ALL ON FUNCTION public.get_child_star_rank(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_child_star_rank(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.leaderboard_top_stars(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leaderboard_top_stars(integer) TO authenticated;
