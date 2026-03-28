-- Progress uses client-side game keys (GameConfig.id from @funberry/game-engine).
-- The previous UUID FK to `games` rejected every save, so `children.total_stars` never updated.

ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_game_id_fkey;

ALTER TABLE progress
  ALTER COLUMN game_id TYPE TEXT USING game_id::text;
