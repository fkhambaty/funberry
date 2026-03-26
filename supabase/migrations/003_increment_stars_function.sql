-- RPC function to atomically increment a child's total star count
CREATE OR REPLACE FUNCTION increment_stars(p_child_id UUID, p_stars INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE children
  SET total_stars = total_stars + p_stars,
      updated_at = now()
  WHERE id = p_child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
