-- Existing D1 database only. Fresh installs already include these columns in schema.sql.
-- Safe to run once. A second run fails on duplicate columns; that means the migration is already applied.

ALTER TABLE parents ADD COLUMN pin_hash TEXT;
ALTER TABLE parents ADD COLUMN pin_salt TEXT;
ALTER TABLE parents ADD COLUMN pin_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE parents ADD COLUMN pin_locked_until TEXT;

CREATE TABLE IF NOT EXISTS product_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS play_events (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  stars_credited INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  played_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_events_name ON product_events(event_name, occurred_at);
CREATE INDEX IF NOT EXISTS idx_product_events_parent ON product_events(parent_id, event_name);
CREATE INDEX IF NOT EXISTS idx_play_events_child ON play_events(child_id, played_at);
CREATE INDEX IF NOT EXISTS idx_play_events_parent ON play_events(parent_id, played_at);
