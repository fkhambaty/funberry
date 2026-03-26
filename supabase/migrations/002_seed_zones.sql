-- Seed all 15 EVS zones
INSERT INTO zones (id, subject, theme_name, display_name, emoji, description, color_key, is_free, order_index, stars_to_unlock) VALUES
  ('about-me',             'evs', 'About Me',                                      'My Home',         '👋',  'Learn about yourself — your body, senses, and feelings!',               'berry',    true,  1,  0),
  ('others-in-my-world',   'evs', 'Others in My World',                             'Village Square',  '👨‍👩‍👧‍👦', 'Meet the people around you — family, friends, and helpers!',            'sky',      false, 2,  5),
  ('food',                 'evs', 'My Needs – Food',                                'The Farm',        '🍎',  'Discover where food comes from and what keeps you healthy!',            'berry',    false, 3,  10),
  ('water',                'evs', 'My Needs – Water',                               'The River',       '💧',  'Splash into learning about water and why we need it!',                 'sky',      false, 4,  15),
  ('shelter',              'evs', 'My Need – Shelter',                              'Builder''s Yard', '🏠',  'Build and explore different types of homes and shelters!',              'sunshine',false, 5,  20),
  ('clothing',             'evs', 'My Need – Clothing',                             'The Wardrobe',    '👕',  'Dress up for every season and learn about fabrics!',                   'berry',    false, 6,  25),
  ('air',                  'evs', 'My Need – Air',                                  'Sky Park',        '🌬️',  'Feel the breeze and learn why air is so important!',                   'sky',      false, 7,  30),
  ('health-safety',        'evs', 'Keeping Oneself Clean, Safe and Healthy',        'Health Center',   '🏥',  'Learn good habits that keep you strong and safe!',                     'leaf',     false, 8,  35),
  ('neighbourhood',        'evs', 'Places in the Neighbourhood',                    'Town Walk',       '🏘️',  'Take a walk and discover places around your town!',                    'sunshine',false, 9,  40),
  ('plants',               'evs', 'Plants',                                         'Magic Garden',    '🌱',  'Grow, explore, and learn all about the wonderful world of plants!',    'leaf',     true,  10, 0),
  ('animals',              'evs', 'Animals',                                        'Animal Park',     '🐾',  'Meet amazing animals — pets, wild animals, and their babies!',         'sunshine',true,  11, 0),
  ('transport',            'evs', 'Transport',                                      'The Station',     '🚂',  'Hop on board and learn about land, water, and air transport!',         'sky',      false, 12, 50),
  ('communication',        'evs', 'Communication',                                  'Post Office',     '📬',  'Send messages and learn how people talk to each other!',               'berry',    false, 13, 55),
  ('sun-moon-stars',       'evs', 'The World Around Me: Sun, Moon, Sky and Stars',  'Star Tower',      '⭐',  'Look up at the sky and explore the sun, moon, and stars!',             'sunshine',false, 14, 60),
  ('time-space-direction', 'evs', 'Time, Space, Direction',                         'Clock Tower',     '🕐',  'Tell time, find directions, and learn about space around you!',        'leaf',     false, 15, 65)
ON CONFLICT (id) DO NOTHING;
