import { Audio } from 'expo-av';

let backgroundMusic = null;

// Global music/sound enabled states
// Background music disabled - voice and sound effects are better for learning
let musicEnabled = false;
let soundEnabled = true;

export const setMusicEnabled = (enabled) => {
  musicEnabled = enabled;
  if (!enabled && backgroundMusic) {
    backgroundMusic.pauseAsync().catch(() => {});
  } else if (enabled && backgroundMusic) {
    backgroundMusic.playAsync().catch(() => {});
  }
};

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
};

export const isMusicEnabled = () => musicEnabled;
export const isSoundEnabled = () => soundEnabled;

export const loadBackgroundMusic = async () => {
  try {
    // Set audio mode for background music
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Load gentle, calming background music for children
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Calmer, gentler track
      {
        isLooping: true,
        volume: 0.03, // Very soft background
        shouldPlay: false,
        rate: 0.6, // Much slower for calm learning environment
        shouldCorrectPitch: true,
      }
    );

    backgroundMusic = sound;
    return sound;
  } catch (e) {
    if (__DEV__) console.log('Music loading error:', e);
    return null;
  }
};

export const playBackgroundMusic = async () => {
  if (!musicEnabled) return;
  try {
    if (backgroundMusic) {
      await backgroundMusic.playAsync();
    }
  } catch (e) {
    if (__DEV__) console.log('Music play error:', e);
  }
};

export const pauseBackgroundMusic = async () => {
  try {
    if (backgroundMusic) {
      await backgroundMusic.pauseAsync();
    }
  } catch (e) {
    if (__DEV__) console.log('Music pause error:', e);
  }
};

export const setMusicVolume = async (volume) => {
  try {
    if (backgroundMusic) {
      await backgroundMusic.setVolumeAsync(volume);
    }
  } catch (e) {
    if (__DEV__) console.log('Volume error:', e);
  }
};

export const stopBackgroundMusic = async () => {
  try {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }
  } catch (e) {
    if (__DEV__) console.log('Music stop error:', e);
  }
};

export const playCelebrationSound = async () => {
  if (!soundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' },
      { volume: 0.4 }
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    if (__DEV__) console.log('Celebration sound error:', e);
  }
};

export const playCorrectSound = async () => {
  if (!soundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/buttons/sounds/button-09.mp3' },
      { volume: 0.3 }
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    if (__DEV__) console.log('Correct sound error:', e);
  }
};

export const playWrongSound = async () => {
  if (!soundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/buttons/sounds/button-10.mp3' },
      { volume: 0.25 }
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    if (__DEV__) console.log('Wrong sound error:', e);
  }
};
