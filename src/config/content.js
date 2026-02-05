// Content tier configuration for freemium-ready architecture
// Currently all content is FREE, but structure supports future premium features

export const CONTENT_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    games: ['Numbers', 'Letters'],
    numbersRange: { min: 1, max: 10 },
    lettersRange: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
    characters: ['SiyaraUnicorn', 'CelineUnicorn', 'NikolaUnicorn', 'BunnyFriend'],
    features: ['basic-progress', 'voice-narration'],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    games: ['Numbers', 'Letters', 'Addition', 'Subtraction'],
    numbersRange: { min: 1, max: 100 },
    lettersRange: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    characters: [
      'SiyaraUnicorn', 'CelineUnicorn', 'NikolaUnicorn', 'MelodyUnicorn',
      'BunnyFriend', 'DogFriend', 'CatFriend', 'OwlFriend'
    ],
    features: [
      'full-progress',
      'voice-narration',
      'all-characters',
      'progress-reports',
      'offline-mode',
    ],
  },
};

// Game metadata for display and premium checking
export const GAMES = {
  Numbers: {
    id: 'Numbers',
    title: 'Numbers',
    subtitle: 'Count with Celine!',
    tier: 'FREE',
    character: 'CelineUnicorn',
    colors: ['#f093fb', '#f5576c'],
    icon: '123',
  },
  Letters: {
    id: 'Letters',
    title: 'Letters',
    subtitle: 'ABCs with Nikola!',
    tier: 'FREE',
    character: 'NikolaUnicorn',
    colors: ['#fa709a', '#fee140'],
    icon: 'ABC',
  },
  Addition: {
    id: 'Addition',
    title: 'Adding',
    subtitle: 'Add with Melody!',
    tier: 'PREMIUM', // Will be FREE for launch
    character: 'MelodyUnicorn',
    colors: ['#4facfe', '#00f2fe'],
    icon: '+',
  },
  Subtraction: {
    id: 'Subtraction',
    title: 'Take Away',
    subtitle: 'Subtract with Melody!',
    tier: 'PREMIUM', // Will be FREE for launch
    character: 'MelodyUnicorn',
    colors: ['#43e97b', '#38f9d7'],
    icon: '-',
  },
};

// Future games placeholder
export const FUTURE_GAMES = {
  Shapes: {
    id: 'Shapes',
    title: 'Shapes',
    subtitle: 'Coming Soon!',
    tier: 'PREMIUM',
    character: 'SiyaraUnicorn',
    colors: ['#667eea', '#764ba2'],
    icon: 'hexagon-outline',
    comingSoon: true,
  },
  Colors: {
    id: 'Colors',
    title: 'Colors',
    subtitle: 'Coming Soon!',
    tier: 'PREMIUM',
    character: 'SiyaraUnicorn',
    colors: ['#f093fb', '#764ba2'],
    icon: 'palette',
    comingSoon: true,
  },
};

// Current access level - set to PREMIUM for free launch (all content unlocked)
// Change to 'FREE' when implementing actual premium features
export const CURRENT_ACCESS = 'PREMIUM';

// Helper to check if a game is unlocked
export const isGameUnlocked = (gameId, accessLevel = CURRENT_ACCESS) => {
  const tier = CONTENT_TIERS[accessLevel];
  if (!tier) return false;
  return tier.games.includes(gameId);
};

// Helper to check if a feature is available
export const hasFeature = (featureId, accessLevel = CURRENT_ACCESS) => {
  const tier = CONTENT_TIERS[accessLevel];
  if (!tier) return false;
  return tier.features.includes(featureId);
};

// App version and build info
export const APP_INFO = {
  version: '1.0.0',
  buildNumber: '1',
  name: 'Unicorn Learning',
  bundleId: {
    ios: 'com.unicornlearning.app',
    android: 'com.unicornlearning.app',
  },
};
