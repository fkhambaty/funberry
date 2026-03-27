-- Leaderboard support: allow any authenticated user to read basic child info
-- for ranking purposes. The existing RLS policy only allows parents to see
-- their own children. This adds a SELECT-only policy for all authenticated users.

-- Drop the existing all-operations policy and replace with separate ones
DROP POLICY IF EXISTS children_own ON children;

-- Parents can still do everything with their own children
CREATE POLICY children_parent_all ON children
  FOR ALL USING (parent_id = auth.uid());

-- Any authenticated user can read names + stars for the leaderboard
CREATE POLICY children_leaderboard_read ON children
  FOR SELECT USING (auth.role() = 'authenticated');
