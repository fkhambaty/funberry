-- Existing D1 database only. Fresh installs already include this table in schema.sql.
-- Safe to run more than once. Apply before deploying a Worker that serves /v1/play-tickets.

CREATE TABLE IF NOT EXISTS play_tickets (
  token_hash TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_play_tickets_parent ON play_tickets(parent_id, expires_at);
