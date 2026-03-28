-- Higher-level developmental lenses for parents (educational framing — not clinical diagnosis).
-- Maps existing skill axes into capability domains; copy is parent-action oriented.

CREATE TABLE IF NOT EXISTS coaching_core_capabilities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  lens_summary TEXT NOT NULL,
  what_strong_signals TEXT NOT NULL,
  what_to_watch TEXT NOT NULL,
  parent_interventions TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skill_axis_capability_map (
  skill_axis_id TEXT NOT NULL REFERENCES coaching_skill_axes(id) ON DELETE CASCADE,
  capability_id TEXT NOT NULL REFERENCES coaching_core_capabilities(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL DEFAULT 1 CHECK (weight > 0),
  PRIMARY KEY (skill_axis_id, capability_id)
);

INSERT INTO coaching_core_capabilities (id, title, lens_summary, what_strong_signals, what_to_watch, parent_interventions, sort_order) VALUES
(
  'deep_focus_self_control',
  'Focus & self-control',
  'This bundles what psychologists often call “attentional control” and parts of executive function: staying on task, filtering distractions, and pausing before answering. Games that reward accuracy over speed train these habits — the same habits that later show up as classroom behaviour and homework stamina.',
  'Your child sustains attention across timed or detail-heavy activities, recovers quickly after mistakes, and does not need constant redirection between short tasks.',
  'Frequent impulsive taps, giving up after one wrong answer, or big score drops only on speed-based games may mean this area needs gentle scaffolding — not punishment.',
  'Use predictable routines before study time; try “pause and point” (finger on the answer for one breath before tapping); shorten sessions but increase frequency; praise effort after errors, not only perfect runs.',
  1
),
(
  'memory_and_language',
  'Memory & language meaning',
  'Working memory and semantic understanding work together: holding a picture or rule in mind while linking it to words. Strong here predicts smoother reading comprehension and following multi-step oral instructions at school.',
  'Remembers game rules, links new vocabulary to images, and improves on repeat visits to the same activity without frustration.',
  'Struggles with “which word goes with which picture” or forgets pairs quickly — may also appear as difficulty retelling a short story.',
  'Read aloud daily; play “remember three things on the tray” games; narrate your own actions; use two-choice questions to reduce cognitive load.',
  2
),
(
  'logic_order_and_categories',
  'Logic, order & categories',
  'Early logical thinking — sorting by rules, same/different, and putting steps in order — underpins maths and science reasoning. It is less about facts and more about flexible rule-following.',
  'Comfortable changing the sort rule, completes sequencing tasks, and explains “why” something belongs in a group.',
  'Gets stuck when the rule changes, or avoids sorting/ordering games in favour of only one favourite mechanic.',
  'Sort real objects (snacks, socks) naming one rule at a time; use “first / next / last” for bedtime; ask “what is different?” about two drawings.',
  3
),
(
  'learning_habits_and_grit',
  'Learning habits & persistence',
  'This is inferred from how your child uses the product: variety of game types, retries after failure, and volume of practice. It does not measure IQ — it measures whether they are building a healthy “practice mindset” that compounds over years.',
  'Touches many activity types, returns to harder games, and session patterns look steady rather than one-off spikes.',
  'Only one game type, very few sessions, or many attempts with no upward trend in stars — worth pairing app play with offline encouragement.',
  'Celebrate retries explicitly; rotate three different game types per week; keep wins visible; avoid linking stars to pocket money at young ages — intrinsic curiosity lasts longer.',
  4
)
ON CONFLICT (id) DO NOTHING;

-- Each skill axis contributes primarily to one capability; weights are relative.
INSERT INTO skill_axis_capability_map (skill_axis_id, capability_id, weight) VALUES
('visual_attention', 'deep_focus_self_control', 1),
('inference_control', 'deep_focus_self_control', 1),
('memory_focus', 'memory_and_language', 1),
('language_semantics', 'memory_and_language', 1),
('classification_logic', 'logic_order_and_categories', 1),
('sequential_thinking', 'logic_order_and_categories', 1)
ON CONFLICT (skill_axis_id, capability_id) DO NOTHING;

ALTER TABLE coaching_core_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY coaching_core_capabilities_read ON coaching_core_capabilities
  FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE skill_axis_capability_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY skill_axis_capability_map_read ON skill_axis_capability_map
  FOR SELECT USING (auth.uid() IS NOT NULL);
