-- Parent coaching analytics: skill axes, game-type → skill weights, cached reports (EVS / ICSE-aligned play data)

CREATE TABLE IF NOT EXISTS coaching_skill_axes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  parent_description TEXT NOT NULL,
  support_tip TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS game_type_skill_contribution (
  game_type TEXT NOT NULL,
  skill_axis_id TEXT NOT NULL REFERENCES coaching_skill_axes(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL DEFAULT 1 CHECK (weight > 0),
  PRIMARY KEY (game_type, skill_axis_id)
);

-- One current coaching snapshot per child (regenerated when parent opens reports)
CREATE TABLE IF NOT EXISTS parent_coaching_reports (
  child_id UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  report JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parent_coaching_reports_updated ON parent_coaching_reports(updated_at DESC);

-- Seed skill axes (psychology-informed labels for parents)
INSERT INTO coaching_skill_axes (id, title, parent_description, support_tip, sort_order) VALUES
('memory_focus', 'Memory & recall', 'How well your child holds information in mind while playing — matching pairs, remembering rules, and recalling facts.', 'Short card games, “what changed?” questions, and gentle repetition help strengthen this.', 1),
('visual_attention', 'Visual focus & detail', 'Spotting differences, tracking moving targets, and discriminating shapes or colours under time pressure.', 'Picture books with “find the…” prompts and sorting toys by colour or shape build this skill.', 2),
('sequential_thinking', 'Order & sequencing', 'Putting steps in the right order and following multi-step logic — foundations for procedures and storytelling.', 'Cooking steps, daily routines, and “first / next / last” stories support sequencing.', 3),
('language_semantics', 'Words & meaning', 'Linking words to pictures, answering questions, and building vocabulary through playful contexts.', 'Name objects during play, read aloud, and ask “which one is the…?” with two choices.', 4),
('classification_logic', 'Sorting & categories', 'Grouping by rules, same/different judgments, and early logical grouping — supports maths and science later.', 'Sort laundry, toys, or snacks by one rule at a time; say the rule out loud.', 5),
('inference_control', 'Inference & self-control', 'Guessing from clues, true/false reasoning, and inhibiting impulsive taps — linked to executive function.', 'Pause-and-think games, simple riddles, and turn-taking board games help practice control.', 6)
ON CONFLICT (id) DO NOTHING;

-- Game engine types → skill contributions (weights are relative within a game session)
INSERT INTO game_type_skill_contribution (game_type, skill_axis_id, weight) VALUES
('picture_quiz', 'memory_focus', 2),
('picture_quiz', 'language_semantics', 2),
('drag_sort', 'classification_logic', 3),
('drag_sort', 'sequential_thinking', 1),
('memory_match', 'memory_focus', 3),
('memory_match', 'visual_attention', 2),
('sequence_builder', 'sequential_thinking', 3),
('sequence_builder', 'classification_logic', 1),
('spot_difference', 'visual_attention', 3),
('spot_difference', 'memory_focus', 1),
('odd_one_out', 'classification_logic', 2),
('odd_one_out', 'inference_control', 2),
('true_false', 'inference_control', 2),
('true_false', 'language_semantics', 1),
('color_activity', 'visual_attention', 2),
('color_activity', 'classification_logic', 2),
('word_picture_link', 'language_semantics', 3),
('word_picture_link', 'memory_focus', 1),
('interactive_story', 'language_semantics', 2),
('interactive_story', 'inference_control', 2),
('interactive_story', 'sequential_thinking', 1),
('bubble_pop', 'visual_attention', 2),
('bubble_pop', 'memory_focus', 1),
('star_catcher', 'visual_attention', 3),
('star_catcher', 'sequential_thinking', 1)
ON CONFLICT (game_type, skill_axis_id) DO NOTHING;

ALTER TABLE parent_coaching_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY parent_coaching_reports_own ON parent_coaching_reports
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Reference tables: readable by authenticated parents (via children scope); axes/contributions are global read
ALTER TABLE coaching_skill_axes ENABLE ROW LEVEL SECURITY;
CREATE POLICY coaching_skill_axes_read ON coaching_skill_axes FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE game_type_skill_contribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY game_type_skill_contribution_read ON game_type_skill_contribution FOR SELECT USING (auth.uid() IS NOT NULL);
