import type { GameConfig } from "../../types";

export const airGames: GameConfig[] = [
  {
    id: "air-needs-sort",
    zoneId: "air",
    type: "drag_sort",
    title: "What Needs Air?",
    description: "Living things need air to breathe — sort them out!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "drag_sort",
      instruction: "Does this need air to live or work, or not really?",
      categories: [
        { id: "needs-air", label: "Needs Air", emoji: "💨" },
        { id: "no-air", label: "Doesn't Need Air", emoji: "🪨" },
      ],
      items: [
        { id: "human", label: "People", emoji: "🧒", category: "needs-air" },
        { id: "dog", label: "Dog", emoji: "🐕", category: "needs-air" },
        { id: "tree", label: "Tree", emoji: "🌳", category: "needs-air" },
        { id: "butterfly", label: "Butterfly", emoji: "🦋", category: "needs-air" },
        { id: "rock", label: "Rock", emoji: "🪨", category: "no-air" },
        { id: "toy-car", label: "Toy car", emoji: "🚗", category: "no-air" },
        { id: "book", label: "Book", emoji: "📖", category: "no-air" },
        { id: "bird", label: "Bird", emoji: "🐦", category: "needs-air" },
      ],
    },
  },
  {
    id: "air-wind-sequence",
    zoneId: "air",
    type: "sequence_builder",
    title: "Wind Power",
    description: "How does wind help us make clean energy?",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "sequence_builder",
      instruction: "Put the wind power story in order!",
      steps: [
        { id: "sun", label: "Sun heats the air", emoji: "☀️", order: 1 },
        { id: "move", label: "Air moves — that's wind!", emoji: "💨", order: 2 },
        { id: "turbine", label: "Wind spins big turbines", emoji: "🌀", order: 3 },
        { id: "spin", label: "Blades turn a generator", emoji: "⚙️", order: 4 },
        { id: "electricity", label: "Electricity powers homes", emoji: "💡", order: 5 },
      ],
    },
  },
  {
    id: "air-quiz",
    zoneId: "air",
    type: "picture_quiz",
    title: "Air Quiz",
    description: "Breathe in facts about air!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "picture_quiz",
      instruction: "What do you know about air?",
      questions: [
        {
          id: "q1",
          question: "Can we see air?",
          options: [
            { id: "yes-color", label: "Yes, it's always pink", emoji: "🩷" },
            { id: "no-invisible", label: "Not usually — it's invisible", emoji: "👻" },
            { id: "yes-square", label: "Yes, square blocks", emoji: "⬜" },
            { id: "only-night", label: "Only at night", emoji: "🌙" },
          ],
          correctId: "no-invisible",
          explanation: "Air is all around us, but we feel it more than we see it!",
        },
        {
          id: "q2",
          question: "What do we breathe in to stay alive?",
          options: [
            { id: "oxygen", label: "Oxygen from air", emoji: "🫁" },
            { id: "juice", label: "Orange juice", emoji: "🧃" },
            { id: "sand", label: "Sand", emoji: "🏖️" },
            { id: "glue", label: "Glue", emoji: "🧴" },
          ],
          correctId: "oxygen",
          explanation: "Our lungs take oxygen from the air into our bodies!",
        },
        {
          id: "q3",
          question: "Trees help clean the air. Is that true?",
          options: [
            { id: "true", label: "Yes, trees are air helpers!", emoji: "🌳" },
            { id: "false", label: "No, trees make air dirty", emoji: "🚫" },
            { id: "only-winter", label: "Only in winter", emoji: "❄️" },
            { id: "only-indoors", label: "Only indoors", emoji: "🏠" },
          ],
          correctId: "true",
          explanation: "Plants use a gas we breathe out and give us fresh oxygen!",
        },
        {
          id: "q4",
          question: "Flying a kite needs…",
          options: [
            { id: "wind", label: "Wind in the air", emoji: "🪁" },
            { id: "gravity-off", label: "No gravity", emoji: "🚀" },
            { id: "water", label: "Only water", emoji: "💧" },
            { id: "dark", label: "Complete darkness", emoji: "🌑" },
          ],
          correctId: "wind",
          explanation: "Wind pushes the kite up so it can dance in the sky!",
        },
      ],
    },
  },
];
