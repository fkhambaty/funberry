import type { GameConfig } from "../../types";

export const healthSafetyGames: GameConfig[] = [
  {
    id: "health-good-habits-quiz",
    zoneId: "health-safety",
    type: "picture_quiz",
    title: "Good Habits",
    description: "Healthy habits keep your body happy!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "picture_quiz",
      instruction: "Which choice is a super healthy habit?",
      questions: [
        {
          id: "q1",
          question: "How do we keep our teeth strong and shiny?",
          options: [
            { id: "never", label: "Never brush", emoji: "🚫" },
            { id: "brush", label: "Brush teeth morning & night", emoji: "🪥" },
            { id: "candy-only", label: "Only eat candy", emoji: "🍬" },
            { id: "mud", label: "Rinse with mud", emoji: "🟤" },
          ],
          correctId: "brush",
          explanation: "Brushing chases away sugar bugs and keeps smiles bright!",
        },
        {
          id: "q2",
          question: "When should you wash your hands?",
          options: [
            { id: "never", label: "Never", emoji: "🙅" },
            { id: "before-after", label: "Before eating & after the toilet", emoji: "🧼" },
            { id: "only-rain", label: "Only in rain", emoji: "🌧️" },
            { id: "midnight-only", label: "Only at midnight", emoji: "🕛" },
          ],
          correctId: "before-after",
          explanation: "Clean hands stop germs from getting into our mouths!",
        },
        {
          id: "q3",
          question: "Why do we sleep enough at night?",
          options: [
            { id: "grow", label: "To grow and feel rested", emoji: "😴" },
            { id: "skip", label: "To skip breakfast", emoji: "🚫" },
            { id: "hide", label: "To hide toys", emoji: "🧸" },
            { id: "tv", label: "To watch TV all night", emoji: "📺" },
          ],
          correctId: "grow",
          explanation: "Sleep is when your body repairs and your brain sorts the day!",
        },
        {
          id: "q4",
          question: "What helps your body after running and playing?",
          options: [
            { id: "water", label: "Drinking water", emoji: "💧" },
            { id: "hot-sauce", label: "Hot sauce", emoji: "🌶️" },
            { id: "skip-meal", label: "Skipping all meals", emoji: "🚫" },
            { id: "couch", label: "Never moving again", emoji: "🛋️" },
          ],
          correctId: "water",
          explanation: "Water replaces what you sweat out and keeps muscles happy!",
        },
      ],
    },
  },
  {
    id: "health-safety-signs-match",
    zoneId: "health-safety",
    type: "memory_match",
    title: "Safety Signs",
    description: "Match safety signs and what they mean!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "memory_match",
      instruction: "Find pairs of safety ideas!",
      pairs: [
        { id: "stop", front: "Stop", emoji: "🛑" },
        { id: "crosswalk", front: "Crosswalk", emoji: "🚸" },
        { id: "fire", front: "Fire exit", emoji: "🚪" },
        { id: "helmet", front: "Wear helmet", emoji: "⛑️" },
        { id: "danger", front: "Danger zone", emoji: "⚠️" },
        { id: "first-aid", front: "First aid", emoji: "🩹" },
      ],
    },
  },
  {
    id: "health-daily-routine-sequence",
    zoneId: "health-safety",
    type: "sequence_builder",
    title: "Daily Routine",
    description: "Order a healthy day from morning to night!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "sequence_builder",
      instruction: "What usually comes first in a good day?",
      steps: [
        { id: "wake", label: "Wake up & stretch", emoji: "🌅", order: 1 },
        { id: "wash", label: "Wash face & brush teeth", emoji: "🪥", order: 2 },
        { id: "breakfast", label: "Eat breakfast", emoji: "🥣", order: 3 },
        { id: "school", label: "School or play & learn", emoji: "🎒", order: 4 },
        { id: "play", label: "Play outside safely", emoji: "⚽", order: 5 },
        { id: "sleep", label: "Bath, story, sleep", emoji: "🌙", order: 6 },
      ],
    },
  },
];
