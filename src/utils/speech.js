import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Global voice enabled state (can be set from GameContext)
let voiceEnabled = true;
let isSpeaking = false;
let speechQueue = [];
let selectedVoice = null;

// Preferred voices for better quality (in order of preference)
// iOS has enhanced voices that sound much better
const PREFERRED_VOICES_IOS = [
  'com.apple.voice.compact.en-US.Samantha', // Samantha - clear female voice
  'com.apple.ttsbundle.Samantha-compact',
  'Samantha',
  'com.apple.voice.compact.en-GB.Daniel', // Daniel - British male
  'Daniel',
  'com.apple.voice.compact.en-US.Nicky', // Nicky - young female voice
  'Nicky',
];

const PREFERRED_VOICES_ANDROID = [
  'en-us-x-sfg#female_1-local', // Google high quality female
  'en-us-x-tpf#female_1-local',
  'en-US-language', // Standard US English
];

// Initialize voice selection
export const initializeVoice = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (__DEV__) console.log('Available voices:', voices.length);

    const preferredList = Platform.OS === 'ios'
      ? PREFERRED_VOICES_IOS
      : PREFERRED_VOICES_ANDROID;

    // Find the first preferred voice that's available
    for (const preferred of preferredList) {
      const found = voices.find(v =>
        v.identifier?.includes(preferred) ||
        v.name?.includes(preferred) ||
        v.identifier === preferred
      );
      if (found) {
        selectedVoice = found.identifier;
        if (__DEV__) console.log('Selected voice:', found.name || found.identifier);
        break;
      }
    }

    // If no preferred voice found, try to find any English voice
    if (!selectedVoice) {
      const englishVoice = voices.find(v =>
        v.language?.startsWith('en') &&
        (v.quality === 'Enhanced' || v.name?.includes('Enhanced'))
      );
      if (englishVoice) {
        selectedVoice = englishVoice.identifier;
        if (__DEV__) console.log('Selected enhanced English voice:', englishVoice.name);
      }
    }
  } catch (e) {
    if (__DEV__) console.log('Error getting voices:', e);
  }
};

export const setVoiceEnabled = (enabled) => {
  voiceEnabled = enabled;
  if (!enabled) {
    // Clear queue and stop speech when disabled
    speechQueue = [];
    Speech.stop();
  }
};

export const isVoiceEnabled = () => voiceEnabled;

// Process the speech queue
const processQueue = async () => {
  if (isSpeaking || speechQueue.length === 0) return;

  isSpeaking = true;
  const { text, options, resolve } = speechQueue.shift();

  try {
    await new Promise((done, reject) => {
      const speechOptions = {
        language: 'en-US',
        pitch: 1.15,  // Slightly higher for friendlier tone
        rate: 0.85,   // Slower for kids to understand
        ...options,
        onDone: done,
        onError: reject,
        onStopped: done,
      };

      // Use selected voice if available
      if (selectedVoice) {
        speechOptions.voice = selectedVoice;
      }

      Speech.speak(text, speechOptions);
    });
  } catch (e) {
    if (__DEV__) console.log('Speech error:', e);
  }

  isSpeaking = false;
  resolve();

  // Small delay between speeches for natural pacing
  await new Promise(r => setTimeout(r, 300));

  // Process next item in queue
  processQueue();
};

// Main speak function - queues speech
export const speak = (text, options = {}) => {
  return new Promise((resolve) => {
    if (!voiceEnabled) {
      resolve();
      return;
    }

    speechQueue.push({ text, options, resolve });
    processQueue();
  });
};

// Speak immediately, canceling any current speech
export const speakNow = async (text, options = {}) => {
  if (!voiceEnabled) return;

  // Clear queue and stop current speech
  speechQueue = [];
  isSpeaking = false;

  try {
    await Speech.stop();
    await new Promise((resolve, reject) => {
      const speechOptions = {
        language: 'en-US',
        pitch: 1.15,
        rate: 0.85,
        ...options,
        onDone: resolve,
        onError: reject,
        onStopped: resolve,
      };

      if (selectedVoice) {
        speechOptions.voice = selectedVoice;
      }

      Speech.speak(text, speechOptions);
    });
  } catch (e) {
    if (__DEV__) console.log('Speech error:', e);
  }
};

export const stopSpeech = async () => {
  speechQueue = [];
  isSpeaking = false;
  try {
    await Speech.stop();
  } catch (e) {
    if (__DEV__) console.log('Stop speech error:', e);
  }
};

// Clear the queue without stopping current speech
export const clearSpeechQueue = () => {
  speechQueue = [];
};

export const speakSlow = async (text) => {
  await speak(text, { rate: 0.75 }); // Much slower for learning
};

export const speakNumber = async (num) => {
  await speak(num.toString(), { rate: 0.8 });
};

export const speakCorrect = async () => {
  const messages = [
    'Great job!',
    'Awesome!',
    'You did it!',
    'Wonderful!',
    'Super!',
    'Amazing!',
    'Fantastic!',
    'Perfect!',
    'Yay!',
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  await speak(msg, { pitch: 1.4, rate: 0.95 });
};

export const speakTryAgain = async () => {
  const messages = [
    'Try again!',
    'Almost! One more try!',
    'Oops! Try again!',
    'So close!',
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  await speak(msg, { pitch: 1.25, rate: 0.9 });
};

// Phonics data with icon names (icons from GameIcons component)
export const phonicsData = {
  A: { sound: 'a', word: 'Apple', example: 'A says a, like Apple!', icon: 'apple', color: '#E53935' },
  B: { sound: 'bu', word: 'Ball', example: 'B says bu, like Ball!', icon: 'soccer', color: '#2196F3' },
  C: { sound: 'ku', word: 'Cat', example: 'C says ku, like Cat!', icon: 'cat', color: '#FF9800' },
  D: { sound: 'du', word: 'Dog', example: 'D says duh, like Dog!', icon: 'dog', color: '#8B4513' },
  E: { sound: 'eh', word: 'Elephant', example: 'E says eh, like Elephant!', icon: 'elephant', color: '#9E9E9E' },
  F: { sound: 'fu', word: 'Fish', example: 'F says fff, like Fish!', icon: 'fish', color: '#FF9800' },
  G: { sound: 'guh', word: 'Goat', example: 'G says guh, like Goat!', icon: 'goat', color: '#795548' },
  H: { sound: 'huh', word: 'Hat', example: 'H says huh, like Hat!', icon: 'hat-fedora', color: '#424242' },
  I: { sound: 'ih', word: 'Ice cream', example: 'I says ih, like Ice cream!', icon: 'ice-cream', color: '#E91E63' },
  J: { sound: 'juh', word: 'Jump', example: 'J says juh, like Jump!', icon: 'kangaroo', color: '#795548' },
  K: { sound: 'kuh', word: 'Kite', example: 'K says kuh, like Kite!', icon: 'kite', color: '#03A9F4' },
  L: { sound: 'l', word: 'Lion', example: 'L says lll, like Lion!', icon: 'lion', color: '#FF9800' },
  M: { sound: 'muh', word: 'Moon', example: 'M says mmm, like Moon!', icon: 'moon-waning-crescent', color: '#FFC107' },
  N: { sound: 'nuh', word: 'Nest', example: 'N says nuh, like Nest!', icon: 'bird', color: '#8BC34A' },
  O: { sound: 'oh', word: 'Orange', example: 'O says oh, like Orange!', icon: 'fruit-citrus', color: '#FF9800' },
  P: { sound: 'puh', word: 'Pig', example: 'P says puh, like Pig!', icon: 'pig', color: '#FFAB91' },
  Q: { sound: 'kwu', word: 'Queen', example: 'Q says kwu, like Queen!', icon: 'crown', color: '#FFD700' },
  R: { sound: 'ruh', word: 'Rainbow', example: 'R says ruh, like Rainbow!', icon: 'palette', color: '#FF5722' },
  S: { sound: 'suh', word: 'Sun', example: 'S says suh, like Sun!', icon: 'white-balance-sunny', color: '#FFC107' },
  T: { sound: 'tu', word: 'Tree', example: 'T says tu, like Tree!', icon: 'tree', color: '#4CAF50' },
  U: { sound: 'uh', word: 'Umbrella', example: 'U says uh, like Umbrella!', icon: 'umbrella', color: '#673AB7' },
  V: { sound: 'vu', word: 'Van', example: 'V says vvv, like Van!', icon: 'van-utility', color: '#607D8B' },
  W: { sound: 'wu', word: 'Water', example: 'W says wuh, like Water!', icon: 'water', color: '#03A9F4' },
  X: { sound: 'x', word: 'Box', example: 'X says x, like Box!', icon: 'package-variant', color: '#795548' },
  Y: { sound: 'yuh', word: 'Yellow', example: 'Y says yuh, like Yellow!', icon: 'star', color: '#FFEB3B' },
  Z: { sound: 'z', word: 'Zebra', example: 'Z says z, like Zebra!', icon: 'horse-variant', color: '#212121' },
};

export const speakPhonics = async (letter) => {
  const data = phonicsData[letter.toUpperCase()];
  if (data) {
    await speak(`${letter}! ${data.example}`, { rate: 0.8 });
  }
};
