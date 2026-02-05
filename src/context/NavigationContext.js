import React, { createContext, useContext, useState } from 'react';
import { stopSpeech } from '../utils/speech';

const NavigationContext = createContext();

export function NavigationContainer({ children }) {
  const [currentScreen, setCurrentScreen] = useState('Intro'); // Start with intro
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screen, params = {}) => {
    // Stop any ongoing speech when navigating
    stopSpeech();
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    // Stop any ongoing speech when going back
    stopSpeech();
    setCurrentScreen('Home');
    setScreenParams({});
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, screenParams, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
