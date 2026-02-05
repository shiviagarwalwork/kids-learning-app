import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import IntroScreen from './IntroScreen';
import HomeScreen from './HomeScreen';
import NumbersGame from './NumbersGame';
import AdditionGame from './AdditionGame';
import SubtractionGame from './SubtractionGame';
import LettersGame from './LettersGame';
import CVCWordsGame from './CVCWordsGame';
import FindLetterGame from './FindLetterGame';
import PopBubblesGame from './PopBubblesGame';
import ShapesGame from './ShapesGame';
import ColorsGame from './ColorsGame';
import CountingGame from './CountingGame';
import SettingsScreen from './SettingsScreen';

export default function AppNavigator() {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'Home':
      return <HomeScreen />;
    case 'Numbers':
      return <NumbersGame />;
    case 'Addition':
      return <AdditionGame />;
    case 'Subtraction':
      return <SubtractionGame />;
    case 'Letters':
      return <LettersGame />;
    case 'Reading':
      return <CVCWordsGame />;
    case 'FindLetter':
      return <FindLetterGame />;
    case 'PopBubbles':
      return <PopBubblesGame />;
    case 'Shapes':
      return <ShapesGame />;
    case 'Colors':
      return <ColorsGame />;
    case 'Counting':
      return <CountingGame />;
    case 'Settings':
      return <SettingsScreen />;
    case 'Intro':
    default:
      // Intro screen is shown first when app opens
      return <IntroScreen />;
  }
}
