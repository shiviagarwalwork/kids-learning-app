import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { useAdaptiveLearning } from '../context/AdaptiveLearningContext';
import { speak, speakPhonics, phonicsData, stopSpeech } from '../utils/speech';
import { NikolaUnicorn, OwlFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import AnswerButton from '../components/AnswerButton';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Phonics images mapping
const PHONICS_IMAGES = {
  A: require('../../assets/images/words/apple.png'),
  B: require('../../assets/images/words/ball.png'),
  C: require('../../assets/images/words/cat.png'),
  D: require('../../assets/images/words/dog.png'),
  E: require('../../assets/images/words/elephant.png'),
  F: require('../../assets/images/words/fish.png'),
  G: require('../../assets/images/words/goat.png'),
  H: require('../../assets/images/words/hat.png'),
  I: require('../../assets/images/words/icecream.png'),
  J: require('../../assets/images/words/jump.png'),
  K: require('../../assets/images/words/kite.png'),
  L: require('../../assets/images/words/lion.png'),
  M: require('../../assets/images/words/moon.png'),
  N: require('../../assets/images/words/nest.png'),
  O: require('../../assets/images/words/orange.png'),
  P: require('../../assets/images/words/pig.png'),
  Q: require('../../assets/images/words/queen.png'),
  R: require('../../assets/images/words/rainbow.png'),
  S: require('../../assets/images/words/sun.png'),
  T: require('../../assets/images/words/tree.png'),
  U: require('../../assets/images/words/umbrella.png'),
  V: require('../../assets/images/words/van.png'),
  W: require('../../assets/images/words/water.png'),
  X: require('../../assets/images/words/box.png'),
  Y: require('../../assets/images/words/yellow.png'),
  Z: require('../../assets/images/words/zebra.png'),
};

export default function LettersGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();
  const { recordAnswer, getWeightedRandomItem, getMasteryLevel } = useAdaptiveLearning();

  const [mode, setMode] = useState('teaching'); // 'teaching' or 'challenge'
  const [currentLetter, setCurrentLetter] = useState('A');
  const [teachingStep, setTeachingStep] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const characterScale = useSharedValue(1);
  const letterScale = useSharedValue(0);
  const letterRotate = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  // Track timeouts for cleanup
  const timeoutRefs = useRef([]);

  useEffect(() => {
    startTeachingMode();

    // Cleanup on unmount
    return () => {
      timeoutRefs.current.forEach(t => clearTimeout(t));
      timeoutRefs.current = [];
      stopSpeech();
    };
  }, []);

  const startTeachingMode = useCallback(() => {
    setMode('teaching');
    setTeachingStep(0);

    // Use adaptive learning to prioritize letters the child needs to practice
    const letter = getWeightedRandomItem('letters', LETTERS) || LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setCurrentLetter(letter);

    // Reset animations
    letterScale.value = 0;
    letterRotate.value = 0;
    wordOpacity.value = 0;
    emojiScale.value = 0;

    setTimeout(() => {
      speak(`Hi! I'm Nikola! Let's learn the letter ${letter}!`);
      runTeachingSequence(letter);
    }, 500);
  }, []);

  const runTeachingSequence = (letter) => {
    const data = phonicsData[letter];

    // Step 1: Show the letter with animation
    setTimeout(() => {
      setTeachingStep(1);
      letterScale.value = withSpring(1, { damping: 8 });
      letterRotate.value = withSequence(
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      speak(`This is the letter ${letter}!`);
    }, 1500);

    // Step 2: Teach the sound
    setTimeout(() => {
      setTeachingStep(2);
      letterScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
        3,
        true
      );
      speak(`${letter} makes the sound "${data.sound}"! ${data.sound}, ${data.sound}, ${data.sound}!`);
    }, 4000);

    // Step 3: Show example word
    setTimeout(() => {
      setTeachingStep(3);
      wordOpacity.value = withTiming(1, { duration: 500 });
      emojiScale.value = withSpring(1, { damping: 8 });
      speak(`${letter} is for ${data.word}! ${data.example}`);
    }, 8000);

    // Move to challenge mode
    setTimeout(() => {
      startChallengeMode();
    }, 13000);
  };

  const startChallengeMode = useCallback(() => {
    setMode('challenge');
    setTeachingStep(0);
    setSelectedAnswer(null);
    setIsCorrect(null);

    // Use adaptive learning to prioritize letters the child needs to practice
    const letter = getWeightedRandomItem('letters', LETTERS) || LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setCurrentLetter(letter);

    const opts = generateLetterOptions(letter);
    setOptions(opts);

    letterScale.value = withSpring(1, { damping: 8 });
    wordOpacity.value = 0;
    emojiScale.value = 0;

    const data = phonicsData[letter];
    setTimeout(() => {
      speak(`Which letter makes the sound "${data.sound}"? ${data.sound} is for ${data.word}!`);
    }, 500);
  }, []);

  const generateLetterOptions = (correct) => {
    const opts = [correct];
    while (opts.length < 3) {
      const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (!opts.includes(randomLetter)) {
        opts.push(randomLetter);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  const handleLetterPress = () => {
    if (mode === 'teaching') {
      const data = phonicsData[currentLetter];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      letterScale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      speakPhonics(currentLetter);
    }
  };

  const handleAnswerPress = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const correct = answer === currentLetter;
    setIsCorrect(correct);

    // Record answer for adaptive learning (AI-driven personalization)
    recordAnswer('letters', currentLetter, correct);

    if (correct) {
      characterScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      const data = phonicsData[currentLetter];
      speak(`Yes! ${currentLetter}! ${data.example} You're a letter superstar!`);
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
      const data = phonicsData[currentLetter];

      // Wrong answer - give detailed explanation and let them try again
      speak(`Oops! That's not quite right.`);

      // Teach the letter sound
      setTimeout(() => {
        speak(`Let me help you! The letter ${currentLetter} says "${data.sound}".`);
      }, 2000);

      // Give example
      setTimeout(() => {
        speak(`${data.sound}, ${data.sound}, ${data.sound}! ${data.example}`);
      }, 5000);

      // Encourage retry
      setTimeout(() => {
        speak(`Now you try! Find the letter ${currentLetter}!`);
      }, 8000);

      // Reset after full explanation - let them try again on same problem
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 10000);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setQuestionsAnswered(0);
    setScore(0);
    startTeachingMode();
  };

  const letterAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: letterScale.value },
      { rotate: `${letterRotate.value}deg` },
    ],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const characterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  const data = phonicsData[currentLetter];

  return (
    <LinearGradient
      colors={['#fa709a', '#fee140', '#f8b500']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Letters"
          score={score}
          onBack={() => navigate('Home')}
          color="#fa709a"
        />

        {/* Character with helper friend */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <View style={styles.characterRow}>
            <NikolaUnicorn size={180} speaking={mode === 'teaching'} teaching />
            <OwlFriend size={90} />
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {mode === 'teaching'
                ? `Let's learn ${currentLetter}!`
                : `Find the letter!`}
            </Text>
          </View>
        </Animated.View>

        {/* Letter display */}
        <View style={styles.letterContainer}>
          <TouchableOpacity onPress={handleLetterPress} activeOpacity={0.8} disabled={mode === 'challenge'}>
            <Animated.View style={[styles.letterCircle, letterAnimStyle]}>
              {/* In teaching mode, show the letter. In challenge mode, show ? until answered */}
              <Text style={styles.letter}>
                {mode === 'teaching' ? currentLetter : (selectedAnswer === currentLetter ? currentLetter : '?')}
              </Text>
              {mode === 'teaching' && teachingStep >= 2 && (
                <Text style={styles.soundText}>"{data.sound}"</Text>
              )}
              {mode === 'challenge' && (
                <Text style={styles.soundText}>"{data.sound}"</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Word and image */}
          {mode === 'teaching' && teachingStep >= 3 && (
            <Animated.View style={[styles.wordContainer, wordStyle]}>
              <Animated.View style={[styles.imageWrapper, emojiStyle]}>
                <Image
                  source={PHONICS_IMAGES[currentLetter]}
                  style={styles.phonicsImage}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.wordText}>
                <Text style={styles.highlightLetter}>{currentLetter}</Text>
                {data.word.slice(1).toLowerCase()}
              </Text>
            </Animated.View>
          )}

          {/* Challenge hint */}
          {mode === 'challenge' && (
            <View style={styles.hintContainer}>
              <Image
                source={PHONICS_IMAGES[currentLetter]}
                style={styles.hintImage}
                resizeMode="contain"
              />
              <Text style={styles.hintText}>
                "{data.sound}" is for {data.word}
              </Text>
            </View>
          )}
        </View>

        {/* Challenge mode options */}
        {mode === 'challenge' && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <AnswerButton
                key={index}
                label={option}
                onPress={() => handleAnswerPress(option)}
                isSelected={selectedAnswer === option}
                isCorrect={selectedAnswer === option ? isCorrect : null}
                size="large"
              />
            ))}
          </View>
        )}

        {/* Tap instruction */}
        {mode === 'teaching' && (
          <Text style={styles.tapInstruction}>
            Tap the letter to hear it again!
          </Text>
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
          message="Letter genius!"
          character={NikolaUnicorn}
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
    color: '#fa709a',
    fontWeight: '600',
    textAlign: 'center',
  },
  letterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  letter: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fa709a',
  },
  soundText: {
    fontSize: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  wordContainer: {
    alignItems: 'center',
    marginTop: 25,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  phonicsImage: {
    width: 80,
    height: 80,
  },
  hintImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  wordEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  highlightLetter: {
    color: '#FFD700',
    fontSize: 40,
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
  },
  hintEmoji: {
    fontSize: 50,
    marginBottom: 5,
  },
  hintText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
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
  tapInstruction: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
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
