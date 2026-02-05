import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [totalStars, setTotalStars] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const [stars, score, sound, music, voice] = await Promise.all([
        AsyncStorage.getItem('totalStars'),
        AsyncStorage.getItem('totalScore'),
        AsyncStorage.getItem('soundEnabled'),
        AsyncStorage.getItem('musicEnabled'),
        AsyncStorage.getItem('voiceEnabled'),
      ]);

      if (stars) setTotalStars(parseInt(stars));
      if (score) setTotalScore(parseInt(score));
      if (sound !== null) setSoundEnabled(sound === 'true');
      if (music !== null) setMusicEnabled(music === 'true');
      if (voice !== null) setVoiceEnabled(voice === 'true');
    } catch (e) {
      console.log('Error loading game data:', e);
    }
  };

  const addStars = async (count) => {
    const newTotal = totalStars + count;
    setTotalStars(newTotal);
    try {
      await AsyncStorage.setItem('totalStars', newTotal.toString());
    } catch (e) {
      console.log('Error saving stars:', e);
    }
  };

  const addScore = async (points) => {
    const newTotal = totalScore + points;
    setTotalScore(newTotal);
    try {
      await AsyncStorage.setItem('totalScore', newTotal.toString());
    } catch (e) {
      console.log('Error saving score:', e);
    }
  };

  const toggleSound = async (enabled) => {
    setSoundEnabled(enabled);
    try {
      await AsyncStorage.setItem('soundEnabled', enabled.toString());
    } catch (e) {
      console.log('Error saving sound setting:', e);
    }
  };

  const toggleMusic = async (enabled) => {
    setMusicEnabled(enabled);
    try {
      await AsyncStorage.setItem('musicEnabled', enabled.toString());
    } catch (e) {
      console.log('Error saving music setting:', e);
    }
  };

  const toggleVoice = async (enabled) => {
    setVoiceEnabled(enabled);
    try {
      await AsyncStorage.setItem('voiceEnabled', enabled.toString());
    } catch (e) {
      console.log('Error saving voice setting:', e);
    }
  };

  const resetProgress = async () => {
    setTotalStars(0);
    setTotalScore(0);
    try {
      await AsyncStorage.multiRemove(['totalStars', 'totalScore']);
    } catch (e) {
      console.log('Error resetting progress:', e);
    }
  };

  return (
    <GameContext.Provider value={{
      // Progress
      totalStars,
      addStars,
      totalScore,
      addScore,
      resetProgress,
      // Settings
      soundEnabled,
      toggleSound,
      musicEnabled,
      toggleMusic,
      voiceEnabled,
      toggleVoice,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
