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
  Easing,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { speak, stopSpeech } from '../utils/speech';
import { CatFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width, height } = Dimensions.get('window');
const BUBBLE_SIZE = 80;

// Bubble component that floats up
function Bubble({ number, x, startY, onPop, isTarget, id }) {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(x);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const wobble = useSharedValue(0);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    // Float upward
    translateY.value = withTiming(-BUBBLE_SIZE, {
      duration: 8000 + Math.random() * 4000,
      easing: Easing.linear,
    });

    // Wobble side to side
    wobble.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 1000 }),
        withTiming(-15, { duration: 1000 })
      ),
      -1,
      true
    );

    // Slight horizontal drift
    translateX.value = withRepeat(
      withSequence(
        withTiming(x + 20, { duration: 2000 }),
        withTiming(x - 20, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const handlePop = () => {
    if (popped) return;
    setPopped(true);

    // Pop animation
    scale.value = withSequence(
      withSpring(1.3),
      withTiming(0, { duration: 200 })
    );
    opacity.value = withTiming(0, { duration: 200 });

    onPop(number, isTarget, id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${wobble.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = [
    ['#FF6B6B', '#FF8E8E'],
    ['#4ECDC4', '#45B7AA'],
    ['#FFE66D', '#FFD93D'],
    ['#95E1D3', '#7DCEA0'],
    ['#DDA0DD', '#DA70D6'],
    ['#87CEEB', '#00BFFF'],
    ['#98D8C8', '#66CDAA'],
    ['#F4A460', '#FF7F50'],
  ];
  const colorPair = colors[number % colors.length];

  return (
    <Animated.View style={[styles.bubble, animatedStyle]}>
      <TouchableOpacity onPress={handlePop} activeOpacity={0.9}>
        <LinearGradient
          colors={colorPair}
          style={styles.bubbleInner}
        >
          <View style={styles.bubbleShine} />
          <Text style={styles.bubbleNumber}>{number}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PopBubblesGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();

  const [targetNumber, setTargetNumber] = useState(1);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState('');

  const characterScale = useSharedValue(1);
  const bubbleIdRef = useRef(0);
  const spawnIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startNewRound();

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopSpeech();
    };
  }, []);

  const startNewRound = () => {
    // Clear existing bubbles
    setBubbles([]);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);

    // Pick target number (1-10)
    const target = Math.floor(Math.random() * 10) + 1;
    setTargetNumber(target);
    setMessage(`Pop the number ${target}!`);

    // Speak instruction
    timeoutRef.current = setTimeout(() => {
      speak(`Pop the number ${target}!`);
    }, 300);

    // Start spawning bubbles
    spawnBubbles(target);
  };

  const spawnBubbles = (target) => {
    // Initial bubbles
    const initialBubbles = [];
    for (let i = 0; i < 5; i++) {
      initialBubbles.push(createBubble(target, i * 150));
    }
    setBubbles(initialBubbles);

    // Spawn more bubbles periodically
    spawnIntervalRef.current = setInterval(() => {
      setBubbles(prev => {
        // Remove bubbles that have floated off screen
        const filtered = prev.filter(b => b.startY > -BUBBLE_SIZE * 2);

        // Add new bubble if we have room
        if (filtered.length < 8) {
          return [...filtered, createBubble(target, 0)];
        }
        return filtered;
      });
    }, 1500);
  };

  const createBubble = (target, delay) => {
    bubbleIdRef.current += 1;
    const isTarget = Math.random() < 0.3; // 30% chance of being target
    const number = isTarget ? target : getRandomNonTarget(target);

    return {
      id: bubbleIdRef.current,
      number,
      x: 30 + Math.random() * (width - BUBBLE_SIZE - 60),
      startY: height - 100 + delay,
      isTarget: number === target,
    };
  };

  const getRandomNonTarget = (target) => {
    let num;
    do {
      num = Math.floor(Math.random() * 10) + 1;
    } while (num === target);
    return num;
  };

  const handlePop = (number, isTarget, id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Remove the bubble
    setBubbles(prev => prev.filter(b => b.id !== id));

    if (isTarget) {
      // Correct!
      characterScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );

      const newScore = score + 1;
      setScore(newScore);
      addScore(10);

      speak(`Yes! ${number}! Pop pop!`);
      setMessage(`Great! You popped ${number}!`);

      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= 5) {
        // Stop spawning
        if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);

        setTimeout(() => {
          addStars(1);
          setShowCelebration(true);
        }, 1000);
      } else {
        // Next round after short delay
        setTimeout(() => {
          startNewRound();
        }, 1500);
      }
    } else {
      // Wrong number
      speak(`That's ${number}. Find ${targetNumber}!`);
      setMessage(`That's ${number}. Pop ${targetNumber}!`);
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
          title="Pop Bubbles"
          score={score}
          onBack={() => navigate('Home')}
          color="#764ba2"
        />

        {/* Character and instruction */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <CatFriend size={100} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{message || `Pop ${targetNumber}!`}</Text>
          </View>
        </Animated.View>

        {/* Target number display */}
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Pop:</Text>
          <View style={styles.targetBubble}>
            <Text style={styles.targetNumber}>{targetNumber}</Text>
          </View>
        </View>

        {/* Bubbles play area */}
        <View style={styles.playArea}>
          {bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              id={bubble.id}
              number={bubble.number}
              x={bubble.x}
              startY={bubble.startY}
              isTarget={bubble.isTarget}
              onPop={handlePop}
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
          message="Bubble popper!"
          character={CatFriend}
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
    maxWidth: '55%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  targetLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  targetBubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  targetNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  playArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
  },
  bubbleInner: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bubbleShine: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 20,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bubbleNumber: {
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
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: 'white',
  },
  progressDotFilled: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
});
