-- FunBerry Kids fresh database on Cloudflare D1.
-- Database name: funberry
-- Database id: e0bf4f89-c29d-4c0d-9674-b5977847e7d1
-- Games and zones stay in the repository. These tables hold new accounts only.

CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  username TEXT,
  pin TEXT,
  pin_hash TEXT,
  pin_salt TEXT,
  pin_attempts INTEGER NOT NULL DEFAULT 0,
  pin_locked_until TEXT,
  role TEXT NOT NULL DEFAULT 'parent',
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_expires_at TEXT,
  welcome_email_sent_at TEXT,
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  subscription_cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  last_sign_in_at TEXT,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar_config TEXT NOT NULL DEFAULT '{"body":"default","hair":"short","color":"#ff9db6"}',
  photo_url TEXT,
  total_stars INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS unlocks (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  zone_id TEXT NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (child_id, zone_id)
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  reward_name TEXT NOT NULL DEFAULT '',
  earned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (child_id, reward_type, reward_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_packs (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'General',
  theme TEXT NOT NULL DEFAULT 'jungle',
  status TEXT NOT NULL DEFAULT 'ready',
  source_text TEXT NOT NULL DEFAULT '',
  generated TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS pack_pages (
  id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  storage_path TEXT,
  ocr_text TEXT NOT NULL DEFAULT '',
  edited_text TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS pack_assignments (
  pack_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  PRIMARY KEY (pack_id, child_id)
);

CREATE TABLE IF NOT EXISTS coaching_reports (
  child_id TEXT PRIMARY KEY,
  report TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_codes (
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  PRIMARY KEY (email, purpose)
);

CREATE TABLE IF NOT EXISTS razorpay_subscriptions (
  subscription_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  short_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  received_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 100,
  free_days INTEGER NOT NULL DEFAULT 7,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT,
  max_redemptions INTEGER,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  redeemed_at TEXT NOT NULL,
  UNIQUE (coupon_id, parent_id)
);

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_username ON parents(username);
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_progress_child ON progress(child_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_child_game ON progress(child_id, game_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_child ON unlocks(child_id);
CREATE INDEX IF NOT EXISTS idx_rewards_child ON rewards(child_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_packs_parent ON learning_packs(parent_id);
CREATE INDEX IF NOT EXISTS idx_pack_pages_pack ON pack_pages(pack_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_subs_user_plan ON razorpay_subscriptions(user_id, plan, created_at);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_parent ON coupon_redemptions(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_events_name ON product_events(event_name, occurred_at);
CREATE INDEX IF NOT EXISTS idx_product_events_parent ON product_events(parent_id, event_name);
CREATE INDEX IF NOT EXISTS idx_play_events_child ON play_events(child_id, played_at);
CREATE INDEX IF NOT EXISTS idx_play_events_parent ON play_events(parent_id, played_at);
