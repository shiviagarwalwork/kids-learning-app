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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { speak, stopSpeech } from '../utils/speech';
import { OwlFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// Objects to count
const OBJECTS = [
  { name: 'stars', icon: 'star', color: '#FFD700' },
  { name: 'hearts', icon: 'heart', color: '#FF6B6B' },
  { name: 'apples', icon: 'apple', color: '#E53935' },
  { name: 'flowers', icon: 'flower', color: '#FF80AB' },
  { name: 'balloons', icon: 'balloon', color: '#9C27B0' },
  { name: 'fish', icon: 'fish', color: '#FF9800' },
  { name: 'butterflies', icon: 'butterfly', color: '#E91E63' },
  { name: 'cookies', icon: 'cookie', color: '#8D6E63' },
];

// Animated counting object
function CountingObject({ icon, color, delay, index }) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    rotation.value = withDelay(
      delay,
      withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
        withTiming(0, { duration: 100 })
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.countingObject, animatedStyle]}>
      <MaterialCommunityIcons name={icon} size={50} color={color} />
    </Animated.View>
  );
}

// Answer button
function AnswerButton({ number, onPress, isCorrect, isWrong, delay }) {
  const scale = useSharedValue(0);
  const shake = useSharedValue(0);
  const backgroundColor = useSharedValue('rgba(255,255,255,0.9)');

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
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
      { translateX: shake.value },
    ],
  }));

  return (
    <Animated.View style={[styles.answerButton, animatedStyle]}>
      <TouchableOpacity
        onPress={() => onPress(number)}
        activeOpacity={0.8}
        style={[
          styles.answerButtonInner,
          isCorrect && styles.correctAnswer,
          isWrong && styles.wrongAnswer,
        ]}
      >
        <Text style={styles.answerText}>{number}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CountingGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();

  const [currentObject, setCurrentObject] = useState(null);
  const [targetCount, setTargetCount] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState('');
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);

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
    // Pick random object type
    const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    setCurrentObject(obj);
    setWrongAnswer(null);
    setCorrectAnswer(null);

    // Pick random count (1-10)
    const count = Math.floor(Math.random() * 10) + 1;
    setTargetCount(count);

    // Generate answer options (including correct answer)
    const correctNum = count;
    const wrongOptions = [];
    while (wrongOptions.length < 3) {
      const wrongNum = Math.floor(Math.random() * 10) + 1;
      if (wrongNum !== correctNum && !wrongOptions.includes(wrongNum)) {
        wrongOptions.push(wrongNum);
      }
    }

    const allOptions = [...wrongOptions, correctNum].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    setMessage(`Count the ${obj.name}!`);

    // Speak instruction
    timeoutRef.current = setTimeout(() => {
      speak(`Count the ${obj.name}! How many do you see?`);
    }, 500);
  };

  const handleAnswerPress = (number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (number === targetCount) {
      // Correct!
      setCorrectAnswer(number);
      characterScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );

      const newScore = score + 1;
      setScore(newScore);
      addScore(10);

      speak(`Yes! There are ${targetCount} ${currentObject.name}! Great counting!`);
      setMessage(`Great! ${targetCount} ${currentObject.name}!`);

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
      setWrongAnswer(number);
      speak(`That's ${number}. Try counting the ${currentObject.name} again!`);
      setMessage(`That's ${number}. Count again!`);

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

  // Generate array of objects to display
  const objectsToShow = currentObject
    ? Array.from({ length: targetCount }, (_, i) => i)
    : [];

  return (
    <LinearGradient
      colors={['#11998e', '#38ef7d']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Counting"
          score={score}
          onBack={() => navigate('Home')}
          color="#11998e"
        />

        {/* Character and instruction */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <OwlFriend size={100} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{message || 'Count the objects!'}</Text>
          </View>
        </Animated.View>

        {/* Objects to count */}
        <View style={styles.objectsContainer}>
          <View style={styles.objectsGrid}>
            {objectsToShow.map((_, index) => (
              <CountingObject
                key={index}
                icon={currentObject?.icon}
                color={currentObject?.color}
                delay={index * 80}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Answer options */}
        <Text style={styles.questionText}>How many?</Text>
        <View style={styles.answersGrid}>
          {options.map((num, index) => (
            <AnswerButton
              key={num}
              number={num}
              onPress={handleAnswerPress}
              isCorrect={correctAnswer === num}
              isWrong={wrongAnswer === num}
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
          message="Counting star!"
          character={OwlFriend}
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
    color: '#11998e',
    fontWeight: '600',
    textAlign: 'center',
  },
  objectsContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    minHeight: 180,
    justifyContent: 'center',
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  countingObject: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 15,
  },
  answerButton: {
    width: (width - 70) / 2,
  },
  answerButtonInner: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  correctAnswer: {
    backgroundColor: '#4CAF50',
  },
  wrongAnswer: {
    backgroundColor: '#FF5252',
  },
  answerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
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
