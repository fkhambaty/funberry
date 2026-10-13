/** One live game for every template. Chosen outside the Computer Lab folders so a tap opens it. */
export const TEMPLATE_GAMES = [
  { type: "picture_quiz", zoneId: "plants", gameId: "plants-parts-quiz", title: "Parts of a Plant" },
  { type: "drag_sort", zoneId: "plants", gameId: "plants-ch1-types-sort", title: "Plant World — types of plants" },
  { type: "memory_match", zoneId: "plants", gameId: "plants-match", title: "Plant & Fruit Match" },
  { type: "sequence_builder", zoneId: "plants", gameId: "plants-sequence", title: "Seed to Flower" },
  { type: "spot_difference", zoneId: "about-me", gameId: "aboutme-spot-senses", title: "Spot the Sense" },
  { type: "odd_one_out", zoneId: "plants", gameId: "plants-odd-garden", title: "Odd Plant Out" },
  { type: "true_false", zoneId: "plants", gameId: "plants-book-nep-how-we-learn", title: "How we learn science" },
  { type: "color_activity", zoneId: "plants", gameId: "plants-color-flower", title: "Color the Flower" },
  { type: "word_picture_link", zoneId: "animals", gameId: "animals-book-word-smart", title: "WORD SMART — Unscramble" },
  { type: "interactive_story", zoneId: "animals", gameId: "animals-book-ch3-read", title: "Animals that Help Us" },
  { type: "bubble_pop", zoneId: "plants", gameId: "plants-bubble-pop", title: "Plant Parts Pop! 🫧" },
  { type: "star_catcher", zoneId: "animals", gameId: "animals-star-catcher", title: "Wild Animal Catcher! ⭐" },
  { type: "pixi_lab", zoneId: "plants", gameId: "plants-pixi-tidy-room", title: "Tidy the room (drag lab)" },
] as const;

export type TemplateGame = (typeof TEMPLATE_GAMES)[number];
