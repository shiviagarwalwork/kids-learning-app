import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { speak, stopSpeech } from '../utils/speech';
import { BunnyFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// Color definitions
const COLORS = [
  { name: 'red', displayName: 'Red', hex: '#FF4444', light: '#FF6666' },
  { name: 'blue', displayName: 'Blue', hex: '#4444FF', light: '#6666FF' },
  { name: 'green', displayName: 'Green', hex: '#44BB44', light: '#66DD66' },
  { name: 'yellow', displayName: 'Yellow', hex: '#FFDD00', light: '#FFEE44' },
  { name: 'orange', displayName: 'Orange', hex: '#FF8800', light: '#FFAA44' },
  { name: 'purple', displayName: 'Purple', hex: '#9944FF', light: '#BB66FF' },
  { name: 'pink', displayName: 'Pink', hex: '#FF66B2', light: '#FF88CC' },
  { name: 'brown', displayName: 'Brown', hex: '#8B4513', light: '#A0522D' },
];

// Animated color balloon
function ColorBalloon({ color, onPress, isWrong, delay }) {
  const scale = useSharedValue(0);
  const wobble = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 8 });
    }, delay);

    // Gentle wobble animation
    wobble.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1500 }),
        withTiming(-5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [delay]);

  useEffect(() => {
    if (isWrong) {
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isWrong]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${wobble.value}deg` },
      { translateX: shake.value },
    ],
  }));

  return (
    <Animated.View style={[styles.balloonContainer, animatedStyle]}>
      <TouchableOpacity
        onPress={() => onPress(color.name)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[color.light, color.hex]}
          style={styles.balloon}
        >
          <View style={styles.balloonShine} />
        </LinearGradient>
        <View style={[styles.balloonString, { backgroundColor: color.hex }]} />
        <Text style={styles.colorLabel}>{color.displayName}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ColorsGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();

  const [targetColor, setTargetColor] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState('');
  const [wrongAnswer, setWrongAnswer] = useState(null);

  const characterScale = useSharedValue(1);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startNewRound();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopSpeech();
    };
  }, []);

  const startNewRound = () => {
    // Pick random target color
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(target);
    setWrongAnswer(null);

    // Pick 3 other random colors for options
    const otherColors = COLORS.filter(c => c.name !== target.name);
    const shuffled = otherColors.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    // Add target and shuffle all options
    const allOptions = [...selected, target].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    setMessage(`Find the ${target.displayName} balloon!`);

    // Speak instruction
    timeoutRef.current = setTimeout(() => {
      speak(`Find the ${target.displayName} balloon!`);
    }, 500);
  };

  const handleColorPress = (colorName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (colorName === targetColor.name) {
      // Correct!
      characterScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );

      const newScore = score + 1;
      setScore(newScore);
      addScore(10);

      speak(`Yes! That's ${targetColor.displayName}! Wonderful!`);
      setMessage(`Great! That's ${targetColor.displayName}!`);

      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= 5) {
        setTimeout(() => {
          addStars(1);
          setShowCelebration(true);
        }, 1500);
      } else {
        setTimeout(() => {
          startNewRound();
        }, 2000);
      }
    } else {
      // Wrong
      setWrongAnswer(colorName);
      const wrongColor = COLORS.find(c => c.name === colorName);
      speak(`That's ${wrongColor.displayName}. Find the ${targetColor.displayName} balloon!`);
      setMessage(`That's ${wrongColor.displayName}. Find ${targetColor.displayName}!`);

      setTimeout(() => setWrongAnswer(null), 500);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setRound(0);
    setScore(0);
    startNewRound();
  };

  const characterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Colors"
          score={score}
          onBack={() => navigate('Home')}
          color="#764ba2"
        />

        {/* Character and instruction */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <BunnyFriend size={100} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{message || 'Find the color!'}</Text>
          </View>
        </Animated.View>

        {/* Target color display */}
        {targetColor && (
          <View style={styles.targetContainer}>
            <Text style={styles.targetLabel}>Find:</Text>
            <View style={[styles.targetColorBox, { backgroundColor: targetColor.hex }]}>
              <View style={styles.targetShine} />
            </View>
            <Text style={styles.targetName}>{targetColor.displayName}</Text>
          </View>
        )}

        {/* Color balloons grid */}
        <View style={styles.balloonsGrid}>
          {options.map((color, index) => (
            <ColorBalloon
              key={color.name}
              color={color}
              onPress={handleColorPress}
              isWrong={wrongAnswer === color.name}
              delay={index * 100}
            />
          ))}
        </View>

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < round && styles.progressDotFilled,
              ]}
            />
          ))}
        </View>
      </View>

      {showCelebration && (
        <CelebrationOverlay
          onComplete={handleCelebrationComplete}
          message="Color expert!"
          character={BunnyFriend}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  characterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  speechBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 10,
    maxWidth: '60%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  speechText: {
    fontSize: 18,
    color: '#764ba2',
    fontWeight: '600',
    textAlign: 'center',
  },
  targetContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  targetLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  targetColorBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  targetShine: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 25,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  targetName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  balloonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
    marginTop: 20,
  },
  balloonContainer: {
    alignItems: 'center',
    width: (width - 80) / 2,
  },
  balloon: {
    width: 100,
    height: 120,
    borderRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  balloonShine: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 30,
    height: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  balloonString: {
    width: 2,
    height: 30,
    alignSelf: 'center',
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 'auto',
    marginBottom: 30,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: 'white',
  },
  progressDotFilled: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
});
