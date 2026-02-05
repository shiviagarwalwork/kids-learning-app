import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { CelineUnicorn, BunnyFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import AnswerButton from '../components/AnswerButton';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// Objects to count with icons
const countingObjects = [
  { icon: 'star', color: '#FFD700', name: 'star', plural: 'stars' },
  { icon: 'apple', color: '#E53935', name: 'apple', plural: 'apples' },
  { icon: 'butterfly', color: '#9C27B0', name: 'butterfly', plural: 'butterflies' },
  { icon: 'flower', color: '#FF80AB', name: 'flower', plural: 'flowers' },
  { icon: 'balloon', color: '#E91E63', name: 'balloon', plural: 'balloons' },
  { icon: 'bird', color: '#03A9F4', name: 'bird', plural: 'birds' },
  { icon: 'cookie', color: '#8D6E63', name: 'cookie', plural: 'cookies' },
  { icon: 'heart', color: '#E91E63', name: 'heart', plural: 'hearts' },
];

export default function NumbersGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();
  const { recordAnswer, getWeightedRandomItem } = useAdaptiveLearning();

  const [mode, setMode] = useState('teaching');
  const [currentNumber, setCurrentNumber] = useState(1);
  const [currentObject, setCurrentObject] = useState(countingObjects[0]);
  const [countedItems, setCountedItems] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const characterScale = useSharedValue(1);
  const objectsOpacity = useSharedValue(0);

  // Refs to track intervals and timeouts for cleanup
  const intervalRef = useRef(null);
  const timeoutRefs = useRef([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutRefs.current.forEach(t => clearTimeout(t));
      stopSpeech();
    };
  }, []);

  const generateOptions = (correct) => {
    const opts = [correct];
    while (opts.length < 3) {
      let option = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (option > 0 && option <= 10 && !opts.includes(option)) {
        opts.push(option);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  // Numbers pool for adaptive learning (1-9 for counting)
  const NUMBERS_POOL = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const startChallengeMode = useCallback(() => {
    setMode('challenge');
    setSelectedAnswer(null);
    setIsCorrect(null);

    // Use adaptive learning to prioritize numbers the child needs to practice
    const numStr = getWeightedRandomItem('numbers', NUMBERS_POOL) || '5';
    const num = parseInt(numStr, 10);
    const obj = countingObjects[Math.floor(Math.random() * countingObjects.length)];
    setCurrentNumber(num);
    setCurrentObject(obj);
    setCountedItems(num);

    const opts = generateOptions(num);
    setOptions(opts);

    objectsOpacity.value = 0;
    objectsOpacity.value = withTiming(1, { duration: 500 });

    const t = setTimeout(() => {
      speak(`Now count the ${obj.plural}! How many do you see?`);
    }, 500);
    timeoutRefs.current.push(t);
  }, [getWeightedRandomItem]);

  const countObjectsSequentially = useCallback((total, obj) => {
    let count = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      count++;
      setCountedItems(count);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      speak(count.toString());

      if (count >= total) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        const t1 = setTimeout(() => {
          speak(`${total}! We counted ${total} ${total === 1 ? obj.name : obj.plural}! Great job!`);

          const t2 = setTimeout(() => {
            startChallengeMode();
          }, 2500);
          timeoutRefs.current.push(t2);
        }, 800);
        timeoutRefs.current.push(t1);
      }
    }, 1200);
  }, [startChallengeMode]);

  const startTeachingMode = useCallback(() => {
    setMode('teaching');
    const num = Math.floor(Math.random() * 5) + 1;
    const obj = countingObjects[Math.floor(Math.random() * countingObjects.length)];
    setCurrentNumber(num);
    setCurrentObject(obj);
    setCountedItems(0);
    objectsOpacity.value = 0;

    const t1 = setTimeout(() => {
      speak(`Hi! I'm Celine! Let's count ${num} ${num === 1 ? obj.name : obj.plural} together!`);
      objectsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

      const t2 = setTimeout(() => {
        countObjectsSequentially(num, obj);
      }, 2000);
      timeoutRefs.current.push(t2);
    }, 500);
    timeoutRefs.current.push(t1);
  }, [countObjectsSequentially]);

  // Initialize teaching mode
  useEffect(() => {
    startTeachingMode();
  }, []);

  const handleAnswerPress = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const correct = answer === currentNumber;
    setIsCorrect(correct);

    // Record answer for adaptive learning (AI-driven personalization)
    recordAnswer('numbers', currentNumber.toString(), correct);

    if (correct) {
      characterScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      speak(`Yes! ${currentNumber}! You're amazing!`);
      setScore(s => s + 1);
      addScore(10);

      setQuestionsAnswered(q => {
        const newCount = q + 1;
        if (newCount >= 5) {
          // Completed round - wait longer for celebration
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

      // Count out loud for the child
      setTimeout(() => {
        speak(`Let's count together! Look at the ${currentObject.plural}.`);
      }, 2000);

      // Count each item slowly
      setTimeout(() => {
        let countText = '';
        for (let i = 1; i <= currentNumber; i++) {
          countText += `${i}... `;
        }
        speak(countText + `The answer is ${currentNumber}!`);
      }, 4500);

      // Reset after full explanation - let them try again
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 8000);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setQuestionsAnswered(0);
    setScore(0);
    startTeachingMode();
  };

  const objectsStyle = useAnimatedStyle(() => ({
    opacity: objectsOpacity.value,
  }));

  const characterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  const renderObjects = () => {
    const items = [];
    const displayCount = mode === 'teaching' ? countedItems : currentNumber;

    for (let i = 0; i < displayCount; i++) {
      items.push(
        <View key={i} style={styles.objectIcon}>
          <MaterialCommunityIcons
            name={currentObject.icon}
            size={50}
            color={currentObject.color}
          />
        </View>
      );
    }
    return items;
  };

  return (
    <LinearGradient
      colors={['#f093fb', '#f5576c', '#ff9a9e']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Counting"
          score={score}
          onBack={() => navigate('Home')}
          color="#f5576c"
        />

        {/* Character with helper friend */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <View style={styles.characterRow}>
            <CelineUnicorn size={180} speaking={mode === 'teaching'} />
            <BunnyFriend size={90} />
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {mode === 'teaching'
                ? `Let's count to ${currentNumber}!`
                : 'How many do you see?'}
            </Text>
          </View>
        </Animated.View>

        {/* Objects to count */}
        <Animated.View style={[styles.objectsContainer, objectsStyle]}>
          <View style={styles.objectsGrid}>
            {renderObjects()}
          </View>
          {mode === 'teaching' && countedItems > 0 && (
            <Text style={styles.countDisplay}>{countedItems}</Text>
          )}
        </Animated.View>

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
          message="You're a counting star!"
          character={CelineUnicorn}
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
    fontSize: 16,
    color: '#f5576c',
    fontWeight: '600',
    textAlign: 'center',
  },
  objectsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: width * 0.8,
    gap: 15,
  },
  objectIcon: {
    padding: 5,
  },
  countDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
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
