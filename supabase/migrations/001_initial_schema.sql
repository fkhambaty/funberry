-- FunBerry Database Schema
-- All tables for the educational games platform

-- Parents (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium_monthly', 'premium_yearly')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Children (profiles managed by parents)
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 3 AND 12),
  avatar_config JSONB NOT NULL DEFAULT '{"body": "default", "hair": "short", "color": "#ff9db6"}',
  total_stars INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Zones (learning zones / adventure areas)
CREATE TABLE IF NOT EXISTS zones (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL DEFAULT 'evs',
  theme_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📚',
  description TEXT NOT NULL DEFAULT '',
  color_key TEXT NOT NULL DEFAULT 'sky',
  is_free BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  stars_to_unlock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Games (individual mini-games within zones)
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN (
    'drag_sort', 'memory_match', 'picture_quiz', 'sequence_builder',
    'spot_difference', 'color_activity', 'word_picture_link', 'interactive_story'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  config JSONB NOT NULL DEFAULT '{}',
  max_stars INTEGER NOT NULL DEFAULT 3,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progress (tracks each child's game attempts)
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  stars_earned INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  score INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unlocks (which zones a child has unlocked)
CREATE TABLE IF NOT EXISTS unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, zone_id)
);

-- Rewards (collectibles earned by children)
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('sticker', 'costume', 'badge', 'title')),
  reward_id TEXT NOT NULL,
  reward_name TEXT NOT NULL DEFAULT '',
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, reward_type, reward_id)
);

-- Indexes for common queries
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_games_zone ON games(zone_id);
CREATE INDEX idx_progress_child ON progress(child_id);
CREATE INDEX idx_progress_game ON progress(game_id);
CREATE INDEX idx_progress_child_game ON progress(child_id, game_id);
CREATE INDEX idx_unlocks_child ON unlocks(child_id);
CREATE INDEX idx_rewards_child ON rewards(child_id);

-- Row-Level Security policies
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Parents can only see/edit their own row
CREATE POLICY parents_own ON parents
  FOR ALL USING (id = auth.uid());

-- Parents can manage their own children
CREATE POLICY children_own ON children
  FOR ALL USING (parent_id = auth.uid());

-- Everyone can read zones and games (public content)
CREATE POLICY zones_public_read ON zones
  FOR SELECT USING (true);

CREATE POLICY games_public_read ON games
  FOR SELECT USING (true);

-- Progress is scoped to children owned by the parent
CREATE POLICY progress_own ON progress
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Unlocks are scoped to children owned by the parent
CREATE POLICY unlocks_own ON unlocks
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Rewards are scoped to children owned by the parent
CREATE POLICY rewards_own ON rewards
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
