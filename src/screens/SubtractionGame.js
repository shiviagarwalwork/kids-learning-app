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
  withSpring,
  FadeOut,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { useAdaptiveLearning } from '../context/AdaptiveLearningContext';
import { speak, stopSpeech } from '../utils/speech';
import { MelodyUnicorn, CatFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import AnswerButton from '../components/AnswerButton';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// Icons for visual subtraction
const mathIcons = [
  { icon: 'star', color: '#FFD700' },
  { icon: 'apple', color: '#E53935' },
  { icon: 'butterfly', color: '#9C27B0' },
  { icon: 'flower', color: '#FF80AB' },
  { icon: 'balloon', color: '#E91E63' },
  { icon: 'cookie', color: '#8D6E63' },
  { icon: 'heart', color: '#E91E63' },
  { icon: 'candy', color: '#E91E63' },
];

export default function SubtractionGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();
  const { recordAnswer, getWeightedRandomItem } = useAdaptiveLearning();

  const [mode, setMode] = useState('teaching'); // 'teaching' or 'challenge'
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(2);
  const [currentIcon, setCurrentIcon] = useState(mathIcons[1]);
  const [teachingStep, setTeachingStep] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const characterScale = useSharedValue(1);
  const itemsOpacity = useSharedValue(0);
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

    // Simple numbers for teaching
    const n1 = Math.floor(Math.random() * 4) + 3; // 3-6
    const n2 = Math.floor(Math.random() * (n1 - 1)) + 1; // 1 to (n1-1)
    const iconData = mathIcons[Math.floor(Math.random() * mathIcons.length)];

    setNum1(n1);
    setNum2(n2);
    setCurrentIcon(iconData);
    setVisibleItems([...Array(n1)].map((_, i) => i));

    // Reset animations
    itemsOpacity.value = 0;
    resultOpacity.value = 0;

    setTimeout(() => {
      speak(`Hi! I'm Melody! Let's learn to subtract!`);
      runTeachingSequence(n1, n2);
    }, 500);
  }, []);

  const runTeachingSequence = (n1, n2) => {
    // Step 1: Show all items
    setTimeout(() => {
      setTeachingStep(1);
      itemsOpacity.value = withTiming(1, { duration: 500 });
      speak(`We start with ${n1} ${n1 === 1 ? 'item' : 'items'}.`);
    }, 2000);

    // Step 2: Take away items one by one
    setTimeout(() => {
      setTeachingStep(2);
      speak(`Now let's take away ${n2}!`);

      // Remove items one by one
      let removed = 0;
      const removeInterval = setInterval(() => {
        if (removed < n2) {
          setVisibleItems(prev => prev.slice(0, -1));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          speak(`Take away one!`);
          removed++;
        } else {
          clearInterval(removeInterval);
        }
      }, 1000);
    }, 4000);

    // Step 3: Show result
    setTimeout(() => {
      setTeachingStep(3);
      resultOpacity.value = withTiming(1, { duration: 500 });
      const result = n1 - n2;
      speak(`${n1} take away ${n2} equals ${result}! We have ${result} left!`);
    }, 4000 + (n2 * 1000) + 1500);

    // Move to challenge mode
    setTimeout(() => {
      startChallengeMode();
    }, 4000 + (n2 * 1000) + 5000);
  };

  // Generate subtraction facts pool for adaptive learning (valid subtractions where result >= 0)
  const generateSubtractionPool = () => {
    const pool = [];
    for (let a = 4; a <= 9; a++) {
      for (let b = 1; b < a; b++) {
        pool.push(`${a}-${b}`);
      }
    }
    return pool;
  };

  const startChallengeMode = useCallback(() => {
    setMode('challenge');
    setTeachingStep(0);
    setSelectedAnswer(null);
    setIsCorrect(null);

    // Use adaptive learning to prioritize subtraction facts the child needs practice
    const subtractionPool = generateSubtractionPool();
    const fact = getWeightedRandomItem('subtraction', subtractionPool) || '5-2';
    const [n1Str, n2Str] = fact.split('-');
    const n1 = parseInt(n1Str, 10);
    const n2 = parseInt(n2Str, 10);
    const iconData = mathIcons[Math.floor(Math.random() * mathIcons.length)];

    setNum1(n1);
    setNum2(n2);
    setCurrentIcon(iconData);
    setVisibleItems([...Array(n1)].map((_, i) => i));

    const opts = generateOptions(n1 - n2);
    setOptions(opts);

    itemsOpacity.value = withTiming(1, { duration: 500 });
    resultOpacity.value = 0;

    setTimeout(() => {
      speak(`What is ${n1} minus ${n2}?`);
    }, 500);
  }, [getWeightedRandomItem]);

  const generateOptions = (correct) => {
    const opts = [correct];
    while (opts.length < 3) {
      let option = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (option >= 0 && option <= 10 && !opts.includes(option)) {
        opts.push(option);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  const handleAnswerPress = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const correctAnswer = num1 - num2;
    const correct = answer === correctAnswer;
    setIsCorrect(correct);

    // Record answer for adaptive learning (AI-driven personalization)
    recordAnswer('subtraction', `${num1}-${num2}`, correct);

    if (correct) {
      characterScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      speak(`Yes! ${num1} take away ${num2} equals ${answer}! Amazing!`);
      setScore(s => s + 1);
      addScore(10);

      // Show the taking away animation
      setVisibleItems(prev => prev.slice(0, correctAnswer));

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
      // Wrong answer - give detailed explanation and let them try again
      speak(`Oops! That's not quite right.`);

      // Explain the taking away concept
      setTimeout(() => {
        speak(`Let me help you! We start with ${num1}.`);
      }, 2000);

      // Show the taking away animation slowly
      setTimeout(() => {
        speak(`Now we take away ${num2}. Watch!`);
        // Animate taking away items one by one
        let itemsLeft = num1;
        const takeAwayInterval = setInterval(() => {
          if (itemsLeft > correctAnswer) {
            itemsLeft--;
            setVisibleItems([...Array(itemsLeft)].map((_, i) => i));
            speak(`${itemsLeft}`);
          } else {
            clearInterval(takeAwayInterval);
          }
        }, 800);
      }, 4000);

      // Final answer
      setTimeout(() => {
        speak(`${num1} take away ${num2} equals ${correctAnswer}! Now you try again!`);
      }, 4000 + (num2 * 900) + 500);

      // Reset after full explanation - let them try again on same problem
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setVisibleItems([...Array(num1)].map((_, i) => i)); // Reset visible items
      }, 4000 + (num2 * 900) + 4000);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setQuestionsAnswered(0);
    setScore(0);
    startTeachingMode();
  };

  const itemsStyle = useAnimatedStyle(() => ({
    opacity: itemsOpacity.value,
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
  }));

  const characterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#43e97b', '#38f9d7', '#4facfe']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Subtraction"
          score={score}
          onBack={() => navigate('Home')}
          color="#43e97b"
        />

        {/* Character with helper friend */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <View style={styles.characterRow}>
            <MelodyUnicorn size={180} speaking={mode === 'teaching'} />
            <CatFriend size={90} />
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {mode === 'teaching'
                ? "Let's subtract!"
                : `${num1} - ${num2} = ?`}
            </Text>
          </View>
        </Animated.View>

        {/* Math visualization */}
        <View style={styles.mathContainer}>
          {/* Equation display */}
          <View style={styles.equationRow}>
            <Text style={styles.equationNumber}>{num1}</Text>
            <Text style={styles.operator}>-</Text>
            <Text style={styles.equationNumber}>{num2}</Text>
            <Text style={styles.operator}>=</Text>
            {(mode === 'teaching' && teachingStep >= 3) || (mode === 'challenge' && selectedAnswer !== null && isCorrect) ? (
              <Animated.View style={resultStyle}>
                <Text style={styles.resultNumber}>{num1 - num2}</Text>
              </Animated.View>
            ) : (
              <Text style={styles.questionMark}>?</Text>
            )}
          </View>

          {/* Visual items */}
          <Animated.View style={[styles.itemsContainer, itemsStyle]}>
            <View style={styles.itemsGrid}>
              {[...Array(num1)].map((_, index) => (
                <Animated.View
                  key={index}
                  style={!visibleItems.includes(index) && styles.itemTakenAway}
                  exiting={FadeOut.duration(300)}
                >
                  <View style={styles.itemIcon}>
                    <MaterialCommunityIcons
                      name={currentIcon.icon}
                      size={40}
                      color={currentIcon.color}
                    />
                  </View>
                </Animated.View>
              ))}
            </View>
            <Text style={styles.remainingCount}>
              {visibleItems.length} left
            </Text>
          </Animated.View>
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
          message="Subtraction superstar!"
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
    color: '#43e97b',
    fontWeight: '600',
    textAlign: 'center',
  },
  mathContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  equationNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginHorizontal: 10,
  },
  operator: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  resultNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  questionMark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: 10,
  },
  itemsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    minWidth: width * 0.7,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: width * 0.6,
  },
  itemIcon: {
    padding: 2,
  },
  itemTakenAway: {
    opacity: 0.2,
  },
  remainingCount: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    marginTop: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
