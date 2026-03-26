-- Seed games for all 15 EVS zones
-- Plants Zone (free)
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('plants', 'picture_quiz', 'Parts of a Plant', 'Can you name the parts of a plant?', 1, '{"gameId": "plants-parts-quiz"}', 1, true),
  ('plants', 'drag_sort', 'Plant or Not a Plant?', 'Sort items into plants and not-plants!', 1, '{"gameId": "plants-sort"}', 2, true),
  ('plants', 'memory_match', 'Plant & Fruit Match', 'Match each plant with its fruit!', 1, '{"gameId": "plants-match"}', 3, false),
  ('plants', 'sequence_builder', 'Seed to Flower', 'Put the steps of plant growth in order!', 1, '{"gameId": "plants-sequence"}', 4, false);

-- Animals Zone (free)
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('animals', 'drag_sort', 'Wild or Pet?', 'Sort the animals into wild and pet!', 1, '{"gameId": "animals-wild-pet-sort"}', 1, true),
  ('animals', 'picture_quiz', 'Animal Sounds', 'Which animal makes this sound?', 1, '{"gameId": "animals-sounds-quiz"}', 2, true),
  ('animals', 'memory_match', 'Baby Animals', 'Match the animal with its baby!', 2, '{"gameId": "animals-baby-match"}', 3, false),
  ('animals', 'sequence_builder', 'Butterfly Life Cycle', 'Arrange the stages of a butterfly!', 2, '{"gameId": "animals-life-sequence"}', 4, false);

-- About Me Zone (free)
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('about-me', 'picture_quiz', 'My Body Parts', 'Can you name parts of your body?', 1, '{"gameId": "aboutme-body-quiz"}', 1, true),
  ('about-me', 'drag_sort', 'My Five Senses', 'Match each thing to the sense you use!', 1, '{"gameId": "aboutme-senses-sort"}', 2, true),
  ('about-me', 'memory_match', 'Feelings Match', 'Match the feeling with its emoji!', 1, '{"gameId": "aboutme-feelings-match"}', 3, false);

-- Others in My World Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('others-in-my-world', 'picture_quiz', 'Who Helps Us?', 'Learn about community helpers!', 1, '{"gameId": "others-helpers-quiz"}', 1, false),
  ('others-in-my-world', 'drag_sort', 'My Family', 'Sort family members!', 1, '{"gameId": "others-family-sort"}', 2, false),
  ('others-in-my-world', 'memory_match', 'Community Helpers Match', 'Match helpers to their tools!', 1, '{"gameId": "others-helpers-match"}', 3, false);

-- Food Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('food', 'drag_sort', 'Healthy vs Junk', 'Sort healthy and junk food!', 1, '{"gameId": "food-healthy-sort"}', 1, false),
  ('food', 'picture_quiz', 'Where Does It Grow?', 'Where does this food come from?', 1, '{"gameId": "food-grow-quiz"}', 2, false),
  ('food', 'memory_match', 'Food Groups Match', 'Match foods to their groups!', 1, '{"gameId": "food-groups-match"}', 3, false);

-- Water Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('water', 'drag_sort', 'Uses of Water', 'How do we use water?', 1, '{"gameId": "water-uses-sort"}', 1, false),
  ('water', 'sequence_builder', 'Save Water', 'Steps to save water!', 1, '{"gameId": "water-save-sequence"}', 2, false),
  ('water', 'picture_quiz', 'Water Quiz', 'Test what you know about water!', 1, '{"gameId": "water-quiz"}', 3, false);

-- Shelter Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('shelter', 'picture_quiz', 'Types of Houses', 'Different houses around the world!', 1, '{"gameId": "shelter-houses-quiz"}', 1, false),
  ('shelter', 'sequence_builder', 'Build a House', 'Steps to build a house!', 1, '{"gameId": "shelter-build-sequence"}', 2, false),
  ('shelter', 'memory_match', 'Animal Homes Match', 'Match animals to their homes!', 1, '{"gameId": "shelter-animal-match"}', 3, false);

-- Clothing Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('clothing', 'drag_sort', 'Season Dress-Up', 'Dress up for each season!', 1, '{"gameId": "clothing-season-sort"}', 1, false),
  ('clothing', 'memory_match', 'Fabric Match', 'Match fabrics!', 1, '{"gameId": "clothing-fabric-match"}', 2, false),
  ('clothing', 'picture_quiz', 'What to Wear?', 'Pick the right outfit!', 1, '{"gameId": "clothing-wear-quiz"}', 3, false);

-- Air Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('air', 'drag_sort', 'What Needs Air?', 'Sort things that need air!', 1, '{"gameId": "air-needs-sort"}', 1, false),
  ('air', 'sequence_builder', 'Wind Power', 'How wind helps us!', 1, '{"gameId": "air-wind-sequence"}', 2, false),
  ('air', 'picture_quiz', 'Air Quiz', 'Test what you know about air!', 1, '{"gameId": "air-quiz"}', 3, false);

-- Health & Safety Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('health-safety', 'picture_quiz', 'Good Habits', 'Learn healthy habits!', 1, '{"gameId": "health-habits-quiz"}', 1, false),
  ('health-safety', 'memory_match', 'Safety Signs', 'Match safety signs!', 1, '{"gameId": "health-safety-match"}', 2, false),
  ('health-safety', 'sequence_builder', 'Daily Routine', 'A healthy daily routine!', 1, '{"gameId": "health-routine-sequence"}', 3, false);

-- Neighbourhood Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('neighbourhood', 'picture_quiz', 'Places Around Us', 'Know your neighbourhood!', 1, '{"gameId": "neighbourhood-places-quiz"}', 1, false),
  ('neighbourhood', 'memory_match', 'Community Helpers', 'Match helpers to places!', 1, '{"gameId": "neighbourhood-helpers-match"}', 2, false),
  ('neighbourhood', 'sequence_builder', 'Going to School', 'Steps to get to school!', 1, '{"gameId": "neighbourhood-school-sequence"}', 3, false);

-- Transport Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('transport', 'drag_sort', 'Land, Water, Air', 'Sort vehicles by type!', 1, '{"gameId": "transport-sort"}', 1, false),
  ('transport', 'picture_quiz', 'Traffic Rules', 'Know the traffic rules!', 1, '{"gameId": "transport-rules-quiz"}', 2, false),
  ('transport', 'sequence_builder', 'Journey Steps', 'Steps of a journey!', 1, '{"gameId": "transport-journey-sequence"}', 3, false);

-- Communication Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('communication', 'drag_sort', 'Old vs New', 'Sort old and new communication!', 1, '{"gameId": "communication-old-new-sort"}', 1, false),
  ('communication', 'sequence_builder', 'Send a Letter', 'Steps to send a letter!', 1, '{"gameId": "communication-letter-sequence"}', 2, false),
  ('communication', 'picture_quiz', 'Communication Quiz', 'How do we communicate?', 1, '{"gameId": "communication-quiz"}', 3, false);

-- Sun Moon Stars Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('sun-moon-stars', 'drag_sort', 'Day vs Night', 'Sort day and night activities!', 1, '{"gameId": "sunmoon-day-night-sort"}', 1, false),
  ('sun-moon-stars', 'sequence_builder', 'Moon Phases', 'Order of moon phases!', 1, '{"gameId": "sunmoon-phases-sequence"}', 2, false),
  ('sun-moon-stars', 'picture_quiz', 'Space Quiz', 'What do you know about space?', 1, '{"gameId": "sunmoon-space-quiz"}', 3, false);

-- Time Space Direction Zone
INSERT INTO games (zone_id, game_type, title, description, difficulty, config, order_index, is_free) VALUES
  ('time-space-direction', 'picture_quiz', 'Read the Clock', 'Can you tell the time?', 1, '{"gameId": "time-clock-quiz"}', 1, false),
  ('time-space-direction', 'picture_quiz', 'Left or Right?', 'Which direction is it?', 1, '{"gameId": "time-direction-quiz"}', 2, false),
  ('time-space-direction', 'sequence_builder', 'My Day', 'Arrange your daily routine!', 1, '{"gameId": "time-day-sequence"}', 3, false);
