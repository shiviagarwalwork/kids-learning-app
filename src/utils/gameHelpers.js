// Random number between min and max (inclusive)
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Shuffle array
export const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Generate wrong answers for multiple choice
export const generateAnswers = (correct, count, min, max) => {
  const answers = new Set([correct]);
  while (answers.size < count) {
    const wrong = randomInt(min, max);
    if (wrong !== correct) answers.add(wrong);
  }
  return shuffle([...answers]);
};

// Generate wrong letter answers
export const generateLetterAnswers = (correct, count) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const answers = new Set([correct]);
  while (answers.size < count) {
    const wrong = letters[randomInt(0, 25)];
    if (wrong !== correct) answers.add(wrong);
  }
  return shuffle([...answers]);
};

// Object types for counting games (using MaterialCommunityIcons names)
export const objectTypes = [
  { name: 'apples', color: '#E53935', icon: 'apple' },
  { name: 'bananas', color: '#FDD835', icon: 'fruit-cherries' },
  { name: 'stars', color: '#FFD700', icon: 'star' },
  { name: 'hearts', color: '#E91E63', icon: 'heart' },
  { name: 'balls', color: '#2196F3', icon: 'soccer' },
  { name: 'flowers', color: '#FF80AB', icon: 'flower' },
  { name: 'cookies', color: '#8D6E63', icon: 'cookie' },
  { name: 'fish', color: '#FF9800', icon: 'fish' },
  { name: 'butterflies', color: '#9C27B0', icon: 'butterfly' },
  { name: 'birds', color: '#03A9F4', icon: 'bird' },
];

export const getRandomObject = () => {
  return objectTypes[randomInt(0, objectTypes.length - 1)];
};

// Character data
export const characters = {
  buddy: {
    name: 'Buddy',
    type: 'puppy',
    color: '#8B4513',
    greeting: "Hi! I'm Buddy the Puppy! Let's learn together!",
  },
  ruby: {
    name: 'Ruby',
    type: 'bunny',
    color: '#FFB6C1',
    greeting: "Hello! I'm Ruby the Bunny! I love counting!",
  },
  professor: {
    name: 'Professor Owl',
    type: 'owl',
    color: '#6B4226',
    greeting: "Greetings! I'm Professor Owl! Let's learn letters!",
  },
  kiki: {
    name: 'Kiki',
    type: 'kitten',
    color: '#FFA726',
    greeting: "Meow! I'm Kiki! Math is so much fun!",
  },
};
