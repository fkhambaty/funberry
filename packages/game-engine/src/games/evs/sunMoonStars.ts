import type { GameConfig } from "../../types";

export const sunMoonStarsGames: GameConfig[] = [
  {
    id: "sunmoon-day-night-sort",
    zoneId: "sun-moon-stars",
    type: "drag_sort",
    title: "Day vs Night",
    description: "Sort what you usually see or do when the sun or moon is out!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "drag_sort",
      instruction: "Is this more like daytime or nighttime?",
      categories: [
        { id: "day", label: "Day", emoji: "☀️" },
        { id: "night", label: "Night", emoji: "🌙" },
      ],
      items: [
        { id: "sun", label: "Bright sun in sky", emoji: "☀️", category: "day" },
        { id: "stars", label: "Twinkling stars", emoji: "⭐", category: "night" },
        { id: "playground", label: "Playground after school", emoji: "🛝", category: "day" },
        { id: "bedtime", label: "Bedtime story", emoji: "📖", category: "night" },
        { id: "shadows", label: "Short shadows at noon", emoji: "🌤️", category: "day" },
        { id: "owl", label: "Owl hooting", emoji: "🦉", category: "night" },
        { id: "breakfast", label: "Breakfast time", emoji: "🍳", category: "day" },
        { id: "moon", label: "Full moon", emoji: "🌕", category: "night" },
      ],
    },
  },
  {
    id: "sunmoon-phases-sequence",
    zoneId: "sun-moon-stars",
    type: "sequence_builder",
    title: "Moon Phases",
    description: "Watch the moon change shape over about a month!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "sequence_builder",
      instruction: "Arrange the moon shapes from new to full (simplified story)!",
      steps: [
        { id: "new", label: "New moon (hard to see)", emoji: "🌑", order: 1 },
        { id: "wax-crescent", label: "Thin crescent grows", emoji: "🌒", order: 2 },
        { id: "half", label: "Half moon", emoji: "🌓", order: 3 },
        { id: "gibbous", label: "Almost full", emoji: "🌔", order: 4 },
        { id: "full", label: "Full moon — big and round!", emoji: "🌕", order: 5 },
      ],
    },
  },
  {
    id: "sunmoon-space-quiz",
    zoneId: "sun-moon-stars",
    type: "picture_quiz",
    title: "Space Quiz",
    description: "Fun facts about the sun, moon, and stars!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "picture_quiz",
      instruction: "What shines in the sky?",
      questions: [
        {
          id: "q1",
          question: "What gives Earth daylight and warmth?",
          options: [
            { id: "moon", label: "The moon", emoji: "🌙" },
            { id: "sun", label: "The sun", emoji: "☀️" },
            { id: "lamp", label: "Only bedroom lamps", emoji: "💡" },
            { id: "snow", label: "Snowflakes", emoji: "❄️" },
          ],
          correctId: "sun",
          explanation: "The sun is a star so big and bright it lights our whole day!",
        },
        {
          id: "q2",
          question: "The moon shines at night because…",
          options: [
            { id: "battery", label: "It has batteries", emoji: "🔋" },
            { id: "reflect", label: "It reflects sunlight", emoji: "🌕" },
            { id: "paint", label: "Someone painted it", emoji: "🎨" },
            { id: "candle", label: "It is a giant candle", emoji: "🕯️" },
          ],
          correctId: "reflect",
          explanation: "Moonlight is really sunlight bouncing off the moon toward us!",
        },
        {
          id: "q3",
          question: "Stars look tiny because…",
          options: [
            { id: "far", label: "They are very far away", emoji: "✨" },
            { id: "stickers", label: "They are stickers on sky", emoji: "⭐" },
            { id: "bugs", label: "They are fireflies only", emoji: "🪲" },
            { id: "inside", label: "They live inside clouds", emoji: "☁️" },
          ],
          correctId: "far",
          explanation: "Stars are huge suns — they only look small from Earth!",
        },
        {
          id: "q4",
          question: "Is it safe to look straight at the midday sun?",
          options: [
            { id: "yes", label: "Yes, always stare", emoji: "👀" },
            { id: "no", label: "No — it can hurt your eyes", emoji: "🕶️" },
            { id: "only-rain", label: "Only when it rains", emoji: "🌧️" },
            { id: "with-magnifier", label: "Yes with a magnifying glass", emoji: "🔍" },
          ],
          correctId: "no",
          explanation: "Never stare at the sun — use special glasses only with grown-ups for eclipses!",
        },
      ],
    },
  },
];
