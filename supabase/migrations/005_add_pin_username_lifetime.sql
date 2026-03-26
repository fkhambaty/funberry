-- Add PIN, username, and lifetime subscription tier to parents
ALTER TABLE parents ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT NULL;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS username TEXT DEFAULT NULL;

ALTER TABLE parents DROP CONSTRAINT IF EXISTS parents_subscription_tier_check;
ALTER TABLE parents ADD CONSTRAINT parents_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'premium_monthly', 'premium_yearly', 'lifetime'));
