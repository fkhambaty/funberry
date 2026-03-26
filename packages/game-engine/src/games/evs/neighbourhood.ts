import type { GameConfig } from "../../types";

export const neighbourhoodGames: GameConfig[] = [
  {
    id: "neighbourhood-places-quiz",
    zoneId: "neighbourhood",
    type: "picture_quiz",
    title: "Places Around Us",
    description: "Know the special places in your town!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "picture_quiz",
      instruction: "Where would you go for each need?",
      questions: [
        {
          id: "q1",
          question: "Where do you go when you are very sick and need a doctor?",
          options: [
            { id: "park", label: "Park", emoji: "🌳" },
            { id: "hospital", label: "Hospital", emoji: "🏥" },
            { id: "bakery", label: "Bakery", emoji: "🥐" },
            { id: "zoo", label: "Zoo", emoji: "🦁" },
          ],
          correctId: "hospital",
          explanation: "Hospitals and clinics have doctors and nurses to help you heal!",
        },
        {
          id: "q2",
          question: "Where do children learn reading and math together?",
          options: [
            { id: "school", label: "School", emoji: "🏫" },
            { id: "pool", label: "Swimming pool", emoji: "🏊" },
            { id: "farm", label: "Farm only", emoji: "🚜" },
            { id: "moon", label: "The moon", emoji: "🌙" },
          ],
          correctId: "school",
          explanation: "School is where teachers and friends learn with you every day!",
        },
        {
          id: "q3",
          question: "Where can you buy fruits, veggies, and food from sellers?",
          options: [
            { id: "market", label: "Market / shop", emoji: "🛒" },
            { id: "desert", label: "Desert", emoji: "🏜️" },
            { id: "volcano", label: "Volcano", emoji: "🌋" },
            { id: "cloud", label: "On a cloud", emoji: "☁️" },
          ],
          correctId: "market",
          explanation: "Markets and stores are where families buy fresh food!",
        },
        {
          id: "q4",
          question: "Where can you play on swings and slides outdoors?",
          options: [
            { id: "park", label: "Park", emoji: "🛝" },
            { id: "office", label: "Office desk", emoji: "💼" },
            { id: "elevator", label: "Elevator", emoji: "🛗" },
            { id: "closet", label: "Tiny closet", emoji: "🚪" },
          ],
          correctId: "park",
          explanation: "Parks are green spaces for play, walks, and picnics!",
        },
      ],
    },
  },
  {
    id: "neighbourhood-helpers-match",
    zoneId: "neighbourhood",
    type: "memory_match",
    title: "Community Helpers",
    description: "Match helpers with their neighborhood jobs!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "memory_match",
      instruction: "Flip and match community heroes!",
      pairs: [
        { id: "baker", front: "Baker", emoji: "🥖" },
        { id: "garbage", front: "Garbage collector", emoji: "🗑️" },
        { id: "librarian", front: "Librarian", emoji: "📚" },
        { id: "crossing", front: "Crossing guard", emoji: "🚸" },
        { id: "mail", front: "Mail carrier", emoji: "📬" },
        { id: "vet", front: "Vet", emoji: "🐾" },
      ],
    },
  },
  {
    id: "neighbourhood-school-sequence",
    zoneId: "neighbourhood",
    type: "sequence_builder",
    title: "Going to School",
    description: "Put the morning trip to school in order!",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "sequence_builder",
      instruction: "What happens on a school morning?",
      steps: [
        { id: "wake", label: "Wake up", emoji: "⏰", order: 1 },
        { id: "dress", label: "Get dressed & pack bag", emoji: "🎒", order: 2 },
        { id: "breakfast", label: "Eat breakfast", emoji: "🥞", order: 3 },
        { id: "travel", label: "Walk, bus, or car to school", emoji: "🚌", order: 4 },
        { id: "gate", label: "Arrive at school gate", emoji: "🏫", order: 5 },
        { id: "class", label: "Hello, classroom!", emoji: "👋", order: 6 },
      ],
    },
  },
];
