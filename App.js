import React, { useEffect } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from './src/context/NavigationContext';
import { GameProvider } from './src/context/GameContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { AdaptiveLearningProvider } from './src/context/AdaptiveLearningContext';
import AppNavigator from './src/screens/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { loadBackgroundMusic, playBackgroundMusic } from './src/utils/music';
import { initializeVoice } from './src/utils/speech';

export default function App() {
  useEffect(() => {
    // Initialize voice and music when app starts
    const init = async () => {
      await initializeVoice();
      await loadBackgroundMusic();
      await playBackgroundMusic();
    };
    init();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PremiumProvider>
        <AdaptiveLearningProvider>
          <GameProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </GameProvider>
        </AdaptiveLearningProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}
