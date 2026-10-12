-- Billing and coupons for the live D1 database.
-- Safe to run once. Fresh databases already get these objects from schema.sql.

ALTER TABLE parents ADD COLUMN subscription_cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
ALTER TABLE parents ADD COLUMN last_sign_in_at TEXT;

CREATE TABLE IF NOT EXISTS razorpay_subscriptions (
  subscription_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  short_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_razorpay_subs_user_plan
  ON razorpay_subscriptions (user_id, plan, created_at);

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

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_parent ON coupon_redemptions(parent_id);

UPDATE parents
SET role = 'admin'
WHERE lower(email) IN ('fakhruddinkhambaty@gmail.com', 'fktiindia@gmail.com');
