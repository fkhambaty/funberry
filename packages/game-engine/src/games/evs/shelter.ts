import type { GameConfig } from "../../types";

export const shelterGames: GameConfig[] = [
  {
    id: "shelter-houses-quiz",
    zoneId: "shelter",
    type: "picture_quiz",
    title: "Types of Houses",
    description: "Homes look different around the world!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "picture_quiz",
      instruction: "Which home matches the clue?",
      questions: [
        {
          id: "q1",
          question: "Which home is often made from mud or sticks in villages?",
          options: [
            { id: "igloo", label: "Igloo", emoji: "🧊" },
            { id: "hut", label: "Hut", emoji: "🛖" },
            { id: "skyscraper", label: "Skyscraper", emoji: "🏙️" },
            { id: "tent", label: "Tent", emoji: "⛺" },
          ],
          correctId: "hut",
          explanation: "A hut is a simple home, often built with local materials like wood or mud!",
        },
        {
          id: "q2",
          question: "Which home is made of snow blocks in very cold places?",
          options: [
            { id: "hut", label: "Hut", emoji: "🛖" },
            { id: "igloo", label: "Igloo", emoji: "🧊" },
            { id: "boat", label: "Boat house", emoji: "⛵" },
            { id: "castle", label: "Castle", emoji: "🏰" },
          ],
          correctId: "igloo",
          explanation: "Igloos keep people warm inside even when it is freezing outside!",
        },
        {
          id: "q3",
          question: "Many city families live in a tall building with many floors. What is it?",
          options: [
            { id: "tent", label: "Tent", emoji: "⛺" },
            { id: "apartment", label: "Apartment building", emoji: "🏢" },
            { id: "cave", label: "Cave", emoji: "🪨" },
            { id: "nest", label: "Bird nest", emoji: "🪺" },
          ],
          correctId: "apartment",
          explanation: "Apartments stack many homes up high so lots of people can live in one building!",
        },
        {
          id: "q4",
          question: "Which home can you fold up and carry for camping?",
          options: [
            { id: "brick", label: "Brick house", emoji: "🧱" },
            { id: "tent", label: "Tent", emoji: "⛺" },
            { id: "palace", label: "Palace", emoji: "🏛️" },
            { id: "barn", label: "Barn", emoji: "🌾" },
          ],
          correctId: "tent",
          explanation: "A tent is a portable shelter — perfect for adventures outdoors!",
        },
      ],
    },
  },
  {
    id: "shelter-build-sequence",
    zoneId: "shelter",
    type: "sequence_builder",
    title: "Build a House",
    description: "Put the steps to build a simple house in order!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "sequence_builder",
      instruction: "What happens first when people build a house?",
      steps: [
        { id: "plan", label: "Make a plan", emoji: "📐", order: 1 },
        { id: "foundation", label: "Dig foundation", emoji: "⛏️", order: 2 },
        { id: "walls", label: "Build walls", emoji: "🧱", order: 3 },
        { id: "roof", label: "Add the roof", emoji: "🏠", order: 4 },
        { id: "windows", label: "Put windows & door", emoji: "🚪", order: 5 },
        { id: "home", label: "Move in — it's home!", emoji: "❤️", order: 6 },
      ],
    },
  },
  {
    id: "shelter-animal-homes-match",
    zoneId: "shelter",
    type: "memory_match",
    title: "Animal Homes Match",
    description: "Match each animal with where it lives!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "memory_match",
      instruction: "Find pairs — animal and its cozy home!",
      pairs: [
        { id: "bird", front: "Bird", emoji: "🪺" },
        { id: "bee", front: "Bee", emoji: "🐝" },
        { id: "dog", front: "Dog", emoji: "🐕" },
        { id: "fish", front: "Fish", emoji: "🐠" },
        { id: "rabbit", front: "Rabbit", emoji: "🐰" },
        { id: "spider", front: "Spider", emoji: "🕷️" },
      ],
    },
  },
];
