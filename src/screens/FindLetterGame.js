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
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { speak, stopSpeech } from '../utils/speech';
import { BunnyFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width, height } = Dimensions.get('window');
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PLAY_AREA_TOP = 200;
const PLAY_AREA_BOTTOM = height - 250;
const LETTER_SIZE = 70;

// Floating letter component
function FloatingLetter({ letter, x, y, isTarget, onPress, delay }) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 8 });
    }, delay);

    // Floating animation
    const randomDuration = 2000 + Math.random() * 2000;
    const randomAmplitudeX = 20 + Math.random() * 30;
    const randomAmplitudeY = 15 + Math.random() * 25;

    translateX.value = withRepeat(
      withSequence(
        withTiming(x + randomAmplitudeX, { duration: randomDuration }),
        withTiming(x - randomAmplitudeX, { duration: randomDuration })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(y + randomAmplitudeY, { duration: randomDuration * 0.8 }),
        withTiming(y - randomAmplitudeY, { duration: randomDuration * 0.8 })
      ),
      -1,
      true
    );

    // Gentle rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: randomDuration }),
        withTiming(-10, { duration: randomDuration })
      ),
      -1,
      true
    );
  }, [x, y, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const colors = [
    ['#FF6B6B', '#FF8E8E'],
    ['#4ECDC4', '#45B7AA'],
    ['#FFE66D', '#FFD93D'],
    ['#95E1D3', '#7DCEA0'],
    ['#DDA0DD', '#DA70D6'],
    ['#87CEEB', '#00BFFF'],
    ['#F0E68C', '#FFD700'],
    ['#98D8C8', '#66CDAA'],
  ];
  const colorPair = colors[letter.charCodeAt(0) % colors.length];

  return (
    <Animated.View style={[styles.floatingLetter, animatedStyle]}>
      <TouchableOpacity
        onPress={() => onPress(letter, isTarget)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colorPair}
          style={styles.letterBubble}
        >
          <Text style={styles.letterText}>{letter}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FindLetterGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();

  const [targetLetter, setTargetLetter] = useState('A');
  const [floatingLetters, setFloatingLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState('');

  const characterScale = useSharedValue(1);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startNewRound();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopSpeech();
    };
  }, []);

  const generatePositions = (count) => {
    const positions = [];
    const padding = 20;
    const cellWidth = (width - padding * 2 - LETTER_SIZE) / 3;
    const cellHeight = (PLAY_AREA_BOTTOM - PLAY_AREA_TOP - LETTER_SIZE) / Math.ceil(count / 3);

    for (let i = 0; i < count; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = padding + col * cellWidth + Math.random() * (cellWidth - LETTER_SIZE);
      const y = PLAY_AREA_TOP + row * cellHeight + Math.random() * (cellHeight - LETTER_SIZE);
      positions.push({ x, y });
    }
    return positions;
  };

  const startNewRound = () => {
    // Pick a random target letter
    const target = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setTargetLetter(target);
    setMessage(`Find the letter ${target}!`);

    // Generate 6-8 letters including the target
    const letterCount = 6 + Math.floor(Math.random() * 3);
    const positions = generatePositions(letterCount);

    // Create letters array with target guaranteed
    const letters = [target];
    while (letters.length < letterCount) {
      const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (!letters.includes(randomLetter)) {
        letters.push(randomLetter);
      }
    }

    // Shuffle letters
    const shuffled = letters.sort(() => Math.random() - 0.5);

    // Create floating letters with positions
    const floating = shuffled.map((letter, index) => ({
      id: `${letter}-${index}-${Date.now()}`,
      letter,
      x: positions[index].x,
      y: positions[index].y,
      isTarget: letter === target,
      delay: index * 100,
    }));

    setFloatingLetters(floating);

    // Speak the instruction
    timeoutRef.current = setTimeout(() => {
      speak(`Find the letter ${target}!`);
    }, 500);
  };

  const handleLetterPress = (letter, isTarget) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isTarget) {
      // Correct!
      characterScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );

      const newScore = score + 1;
      setScore(newScore);
      addScore(10);

      speak(`Yes! That's ${letter}! Great job!`);
      setMessage(`Great job! You found ${letter}!`);

      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= 5) {
        // Game complete
        setTimeout(() => {
          addStars(1);
          setShowCelebration(true);
        }, 1500);
      } else {
        // Next round
        setTimeout(() => {
          startNewRound();
        }, 2000);
      }
    } else {
      // Wrong letter
      speak(`That's ${letter}. Try to find ${targetLetter}!`);
      setMessage(`That's ${letter}. Find ${targetLetter}!`);
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
      colors={['#a8edea', '#fed6e3', '#ffecd2']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Find Letter"
          score={score}
          onBack={() => navigate('Home')}
          color="#4ECDC4"
        />

        {/* Character and instruction */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <BunnyFriend size={120} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{message || `Find ${targetLetter}!`}</Text>
          </View>
        </Animated.View>

        {/* Target letter display */}
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Find:</Text>
          <View style={styles.targetBubble}>
            <Text style={styles.targetLetter}>{targetLetter}</Text>
          </View>
        </View>

        {/* Floating letters play area */}
        <View style={styles.playArea}>
          {floatingLetters.map((item) => (
            <FloatingLetter
              key={item.id}
              letter={item.letter}
              x={item.x}
              y={item.y}
              isTarget={item.isTarget}
              onPress={handleLetterPress}
              delay={item.delay}
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
          message="Letter finder!"
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
    color: '#4ECDC4',
    fontWeight: '600',
    textAlign: 'center',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  targetLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
  },
  targetBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  targetLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  floatingLetter: {
    position: 'absolute',
  },
  letterBubble: {
    width: LETTER_SIZE,
    height: LETTER_SIZE,
    borderRadius: LETTER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  letterText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: 'white',
  },
  progressDotFilled: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
});
