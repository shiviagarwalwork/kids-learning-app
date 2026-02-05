import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { useAdaptiveLearning } from '../context/AdaptiveLearningContext';
import { speak, stopSpeech } from '../utils/speech';
import { MelodyUnicorn, DogFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import AnswerButton from '../components/AnswerButton';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// Icons for visual addition
const mathIcons = [
  { icon: 'star', color: '#FFD700' },
  { icon: 'apple', color: '#E53935' },
  { icon: 'butterfly', color: '#9C27B0' },
  { icon: 'flower', color: '#FF80AB' },
  { icon: 'balloon', color: '#E91E63' },
  { icon: 'cookie', color: '#8D6E63' },
  { icon: 'heart', color: '#E91E63' },
  { icon: 'fish', color: '#FF9800' },
];

export default function AdditionGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();
  const { recordAnswer, getWeightedRandomItem } = useAdaptiveLearning();

  const [mode, setMode] = useState('teaching'); // 'teaching' or 'challenge'
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(1);
  const [currentIcon, setCurrentIcon] = useState(mathIcons[0]);
  const [teachingStep, setTeachingStep] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const characterScale = useSharedValue(1);
  const group1Opacity = useSharedValue(0);
  const group2Opacity = useSharedValue(0);
  const plusOpacity = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  // Track timeouts for cleanup
  const timeoutRefs = useRef([]);

  useEffect(() => {
    startTeachingMode();

    // Cleanup on unmount
    return () => {
      timeoutRefs.current.forEach(t => clearTimeout(t));
      stopSpeech();
    };
  }, []);

  const startTeachingMode = useCallback(() => {
    setMode('teaching');
    setTeachingStep(0);

    // Simple numbers for teaching (1-3 each)
    const n1 = Math.floor(Math.random() * 3) + 1;
    const n2 = Math.floor(Math.random() * 3) + 1;
    const iconData = mathIcons[Math.floor(Math.random() * mathIcons.length)];

    setNum1(n1);
    setNum2(n2);
    setCurrentIcon(iconData);

    // Reset animations
    group1Opacity.value = 0;
    group2Opacity.value = 0;
    plusOpacity.value = 0;
    resultOpacity.value = 0;

    setTimeout(() => {
      speak(`Hi! I'm Melody! Let's learn to add numbers together!`);
      runTeachingSequence(n1, n2);
    }, 500);
  }, []);

  const runTeachingSequence = (n1, n2) => {
    // Step 1: Show first group
    setTimeout(() => {
      setTeachingStep(1);
      group1Opacity.value = withTiming(1, { duration: 500 });
      speak(`First, we have ${n1} ${n1 === 1 ? 'star' : 'stars'}.`);
    }, 2000);

    // Step 2: Show plus and second group
    setTimeout(() => {
      setTeachingStep(2);
      plusOpacity.value = withTiming(1, { duration: 500 });
      group2Opacity.value = withTiming(1, { duration: 500 });
      speak(`Then we add ${n2} more!`);
    }, 4500);

    // Step 3: Show result
    setTimeout(() => {
      setTeachingStep(3);
      resultOpacity.value = withTiming(1, { duration: 500 });
      const sum = n1 + n2;
      speak(`${n1} plus ${n2} equals ${sum}! Great job!`);
    }, 7000);

    // Move to challenge mode
    setTimeout(() => {
      startChallengeMode();
    }, 10000);
  };

  // Generate addition facts pool for adaptive learning (1+1 through 5+5)
  const generateAdditionPool = () => {
    const pool = [];
    for (let a = 1; a <= 5; a++) {
      for (let b = 1; b <= 5; b++) {
        pool.push(`${a}+${b}`);
      }
    }
    return pool;
  };

  const startChallengeMode = useCallback(() => {
    setMode('challenge');
    setTeachingStep(0);
    setSelectedAnswer(null);
    setIsCorrect(null);

    // Use adaptive learning to prioritize addition facts the child needs practice
    const additionPool = generateAdditionPool();
    const fact = getWeightedRandomItem('addition', additionPool) || '2+2';
    const [n1Str, n2Str] = fact.split('+');
    const n1 = parseInt(n1Str, 10);
    const n2 = parseInt(n2Str, 10);
    const iconData = mathIcons[Math.floor(Math.random() * mathIcons.length)];

    setNum1(n1);
    setNum2(n2);
    setCurrentIcon(iconData);

    const opts = generateOptions(n1 + n2);
    setOptions(opts);

    // Show everything at once for challenge
    group1Opacity.value = withTiming(1, { duration: 500 });
    plusOpacity.value = withTiming(1, { duration: 500 });
    group2Opacity.value = withTiming(1, { duration: 500 });
    resultOpacity.value = 0;

    setTimeout(() => {
      speak(`What is ${n1} plus ${n2}?`);
    }, 500);
  }, [getWeightedRandomItem]);

  const generateOptions = (correct) => {
    const opts = [correct];
    while (opts.length < 3) {
      let option = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (option > 0 && option <= 15 && !opts.includes(option)) {
        opts.push(option);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  const handleAnswerPress = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const correct = answer === num1 + num2;
    setIsCorrect(correct);

    // Record answer for adaptive learning (AI-driven personalization)
    recordAnswer('addition', `${num1}+${num2}`, correct);

    if (correct) {
      characterScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      speak(`Yes! ${num1} plus ${num2} equals ${answer}! You're a math star!`);
      setScore(s => s + 1);
      addScore(10);

      setQuestionsAnswered(q => {
        const newCount = q + 1;
        if (newCount >= 5) {
          // Wait longer for celebration
          setTimeout(() => {
            addStars(1);
            setShowCelebration(true);
          }, 2500);
        } else {
          // Wait longer before next question
          setTimeout(() => {
            startChallengeMode();
          }, 3500);
        }
        return newCount;
      });
    } else {
      const correctAnswer = num1 + num2;

      // Wrong answer - give detailed explanation and let them try again
      speak(`Oops! That's not quite right.`);

      // Show visual counting explanation
      setTimeout(() => {
        speak(`Let me help you! We have ${num1}, and we add ${num2} more.`);
      }, 2000);

      // Count it out
      setTimeout(() => {
        let countText = `${num1}... `;
        for (let i = 1; i <= num2; i++) {
          countText += `${num1 + i}... `;
        }
        speak(countText + `${num1} plus ${num2} equals ${correctAnswer}!`);
        resultOpacity.value = withTiming(1, { duration: 500 });
      }, 4500);

      // Reset after full explanation - let them try again on same problem
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        resultOpacity.value = 0;
      }, 9000);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setQuestionsAnswered(0);
    setScore(0);
    startTeachingMode();
  };

  const group1Style = useAnimatedStyle(() => ({
    opacity: group1Opacity.value,
  }));

  const plusStyle = useAnimatedStyle(() => ({
    opacity: plusOpacity.value,
  }));

  const group2Style = useAnimatedStyle(() => ({
    opacity: group2Opacity.value,
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
  }));

  const characterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  const renderIconGroup = (count) => {
    return [...Array(count)].map((_, i) => (
      <View key={i} style={styles.iconItem}>
        <MaterialCommunityIcons
          name={currentIcon.icon}
          size={36}
          color={currentIcon.color}
        />
      </View>
    ));
  };

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe', '#38f9d7']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Addition"
          score={score}
          onBack={() => navigate('Home')}
          color="#4facfe"
        />

        {/* Character with helper friend */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <View style={styles.characterRow}>
            <MelodyUnicorn size={180} speaking={mode === 'teaching'} dancing />
            <DogFriend size={90} />
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {mode === 'teaching'
                ? "Let's add together!"
                : `${num1} + ${num2} = ?`}
            </Text>
          </View>
        </Animated.View>

        {/* Math visualization */}
        <View style={styles.mathContainer}>
          <View style={styles.equation}>
            {/* First group */}
            <Animated.View style={[styles.iconGroup, group1Style]}>
              {renderIconGroup(num1)}
              <Text style={styles.numberLabel}>{num1}</Text>
            </Animated.View>

            {/* Plus sign */}
            <Animated.View style={plusStyle}>
              <Text style={styles.operator}>+</Text>
            </Animated.View>

            {/* Second group */}
            <Animated.View style={[styles.iconGroup, group2Style]}>
              {renderIconGroup(num2)}
              <Text style={styles.numberLabel}>{num2}</Text>
            </Animated.View>

            {/* Equals and result (teaching mode) */}
            {mode === 'teaching' && teachingStep >= 3 && (
              <Animated.View style={[styles.resultContainer, resultStyle]}>
                <Text style={styles.operator}>=</Text>
                <Text style={styles.resultNumber}>{num1 + num2}</Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Challenge mode options */}
        {mode === 'challenge' && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <AnswerButton
                key={index}
                label={option.toString()}
                onPress={() => handleAnswerPress(option)}
                isSelected={selectedAnswer === option}
                isCorrect={selectedAnswer === option ? isCorrect : null}
                size="large"
              />
            ))}
          </View>
        )}

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < questionsAnswered && styles.progressDotFilled,
              ]}
            />
          ))}
        </View>
      </View>

      {showCelebration && (
        <CelebrationOverlay
          onComplete={handleCelebrationComplete}
          message="Addition superstar!"
          character={MelodyUnicorn}
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
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  speechBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: -5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  speechText: {
    fontSize: 18,
    color: '#4facfe',
    fontWeight: '600',
    textAlign: 'center',
  },
  mathContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  equation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  iconGroup: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: 15,
    minWidth: 80,
  },
  iconItem: {
    marginVertical: 2,
  },
  numberLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  operator: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 15,
    marginBottom: 30,
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: 'white',
  },
  progressDotFilled: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
});
