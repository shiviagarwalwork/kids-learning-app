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
  withSpring,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { useAdaptiveLearning } from '../context/AdaptiveLearningContext';
import { speak, stopSpeech } from '../utils/speech';
import { OwlFriend, BunnyFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import AnswerButton from '../components/AnswerButton';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// CVC Words data with real images
const CVC_WORDS = [
  { word: 'cat', image: require('../../assets/images/words/cat.png'), color: '#FF6B6B' },
  { word: 'bat', image: require('../../assets/images/words/bat.png'), color: '#845EC2' },
  { word: 'rat', image: require('../../assets/images/words/rat.png'), color: '#8B4513' },
  { word: 'dog', image: require('../../assets/images/words/dog.png'), color: '#D4A574' },
  { word: 'log', image: require('../../assets/images/words/log.png'), color: '#6B4423' },
  { word: 'fog', image: require('../../assets/images/words/fog.png'), color: '#A0A0A0' },
  { word: 'bug', image: require('../../assets/images/words/bug.png'), color: '#2ECC71' },
  { word: 'mug', image: require('../../assets/images/words/mug.png'), color: '#3498DB' },
  { word: 'rug', image: require('../../assets/images/words/rug.png'), color: '#E74C3C' },
  { word: 'sun', image: require('../../assets/images/words/sun.png'), color: '#F1C40F' },
  { word: 'run', image: require('../../assets/images/words/run.png'), color: '#3498DB' },
  { word: 'cup', image: require('../../assets/images/words/cup.png'), color: '#9B59B6' },
  { word: 'pup', image: require('../../assets/images/words/pup.png'), color: '#E67E22' },
  { word: 'bed', image: require('../../assets/images/words/bed.png'), color: '#1ABC9C' },
  { word: 'hen', image: require('../../assets/images/words/hen.png'), color: '#F39C12' },
  { word: 'pen', image: require('../../assets/images/words/pen.png'), color: '#34495E' },
  { word: 'pig', image: require('../../assets/images/words/pig.png'), color: '#FFB6C1' },
  { word: 'big', image: require('../../assets/images/words/big.png'), color: '#95A5A6' },
  { word: 'dig', image: require('../../assets/images/words/dig.png'), color: '#8B4513' },
  { word: 'pot', image: require('../../assets/images/words/pot.png'), color: '#7F8C8D' },
  { word: 'hot', image: require('../../assets/images/words/hot.png'), color: '#E74C3C' },
  { word: 'box', image: require('../../assets/images/words/box.png'), color: '#D4A574' },
  { word: 'fox', image: require('../../assets/images/words/fox.png'), color: '#E67E22' },
  { word: 'van', image: require('../../assets/images/words/van.png'), color: '#3498DB' },
  { word: 'fan', image: require('../../assets/images/words/fan.png'), color: '#1ABC9C' },
  { word: 'can', image: require('../../assets/images/words/can.png'), color: '#95A5A6' },
  { word: 'map', image: require('../../assets/images/words/map.png'), color: '#F39C12' },
  { word: 'web', image: require('../../assets/images/words/web.png'), color: '#BDC3C7' },
  { word: 'jet', image: require('../../assets/images/words/jet.png'), color: '#3498DB' },
  { word: 'net', image: require('../../assets/images/words/net.png'), color: '#2ECC71' },
];

export default function CVCWordsGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();
  const { recordAnswer, getWeightedRandomItem } = useAdaptiveLearning();

  const [mode, setMode] = useState('teaching'); // 'teaching' or 'challenge'
  const [currentWord, setCurrentWord] = useState(CVC_WORDS[0]);
  const [teachingStep, setTeachingStep] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const characterScale = useSharedValue(1);
  const wordScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const letterBounce = useSharedValue(0);

  const timeoutRefs = useRef([]);

  useEffect(() => {
    startTeachingMode();

    return () => {
      timeoutRefs.current.forEach(t => clearTimeout(t));
      timeoutRefs.current = [];
      stopSpeech();
    };
  }, []);

  const getRandomWord = () => {
    const wordStrings = CVC_WORDS.map(w => w.word);
    const selected = getWeightedRandomItem('cvc_words', wordStrings) ||
      wordStrings[Math.floor(Math.random() * wordStrings.length)];
    return CVC_WORDS.find(w => w.word === selected) || CVC_WORDS[0];
  };

  const startTeachingMode = useCallback(() => {
    setMode('teaching');
    setTeachingStep(0);

    const word = getRandomWord();
    setCurrentWord(word);

    // Reset animations
    wordScale.value = 0;
    iconScale.value = 0;
    letterBounce.value = 0;

    setTimeout(() => {
      speak(`Hoo hoo! I'm Oliver! Let's read the word ${word.word}!`);
      runTeachingSequence(word);
    }, 500);
  }, []);

  const runTeachingSequence = (wordData) => {
    const word = wordData.word;
    const letters = word.split('');

    // Step 1: Show the word
    const t1 = setTimeout(() => {
      setTeachingStep(1);
      wordScale.value = withSpring(1, { damping: 8 });
      speak(`This word is ${word}!`);
    }, 2000);
    timeoutRefs.current.push(t1);

    // Step 2: Sound it out letter by letter
    const t2 = setTimeout(() => {
      setTeachingStep(2);
      letterBounce.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      );
      speak(`Let's sound it out! ${letters[0]}... ${letters[1]}... ${letters[2]}...`);
    }, 4500);
    timeoutRefs.current.push(t2);

    // Step 3: Blend the sounds
    const t3 = setTimeout(() => {
      setTeachingStep(3);
      speak(`${letters[0]}, ${letters[1]}, ${letters[2]}... ${word}!`);
    }, 8000);
    timeoutRefs.current.push(t3);

    // Step 4: Show the picture
    const t4 = setTimeout(() => {
      setTeachingStep(4);
      iconScale.value = withSpring(1, { damping: 8 });
      speak(`${word}! Look, it's a ${word}!`);
    }, 11000);
    timeoutRefs.current.push(t4);

    // Move to challenge mode
    const t5 = setTimeout(() => {
      startChallengeMode();
    }, 15000);
    timeoutRefs.current.push(t5);
  };

  const startChallengeMode = useCallback(() => {
    setMode('challenge');
    setTeachingStep(0);
    setSelectedAnswer(null);
    setIsCorrect(null);

    const word = getRandomWord();
    setCurrentWord(word);

    const opts = generateWordOptions(word);
    setOptions(opts);

    wordScale.value = 0;
    iconScale.value = withSpring(1, { damping: 8 });

    setTimeout(() => {
      speak(`Can you find the word for this picture? What word is this?`);
    }, 500);
  }, []);

  const generateWordOptions = (correct) => {
    const opts = [correct];
    const availableWords = CVC_WORDS.filter(w => w.word !== correct.word);

    while (opts.length < 3 && availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const randomWord = availableWords.splice(randomIndex, 1)[0];
      opts.push(randomWord);
    }

    return opts.sort(() => Math.random() - 0.5);
  };

  const handleWordPress = () => {
    if (mode === 'teaching') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      wordScale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      const letters = currentWord.word.split('');
      speak(`${letters[0]}... ${letters[1]}... ${letters[2]}... ${currentWord.word}!`);
    }
  };

  const handleAnswerPress = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const correct = answer.word === currentWord.word;
    setIsCorrect(correct);

    recordAnswer('cvc_words', currentWord.word, correct);

    if (correct) {
      characterScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      wordScale.value = withSpring(1, { damping: 8 });
      speak(`Hoo hoo! Yes! That's ${currentWord.word}! You're a reading superstar!`);
      setScore(s => s + 1);
      addScore(10);

      setQuestionsAnswered(q => {
        const newCount = q + 1;
        if (newCount >= 5) {
          setTimeout(() => {
            addStars(1);
            setShowCelebration(true);
          }, 2500);
        } else {
          setTimeout(() => {
            startChallengeMode();
          }, 3500);
        }
        return newCount;
      });
    } else {
      const letters = currentWord.word.split('');
      speak(`Oops! Let's try again!`);

      setTimeout(() => {
        speak(`This picture shows a ${currentWord.word}. Let's sound it out: ${letters[0]}... ${letters[1]}... ${letters[2]}... ${currentWord.word}!`);
      }, 2000);

      setTimeout(() => {
        speak(`Now find ${currentWord.word}!`);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 7000);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setQuestionsAnswered(0);
    setScore(0);
    startTeachingMode();
  };

  const wordAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const characterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  const letters = currentWord.word.split('');

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#a855f7']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Reading"
          score={score}
          onBack={() => navigate('Home')}
          color="#667eea"
        />

        {/* Character */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <View style={styles.characterRow}>
            <OwlFriend size={160} />
            <BunnyFriend size={80} />
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {mode === 'teaching'
                ? `Let's read: ${currentWord.word}!`
                : `Find the word!`}
            </Text>
          </View>
        </Animated.View>

        {/* Word display area */}
        <View style={styles.wordContainer}>
          {/* Picture */}
          <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
            <Image
              source={currentWord.image}
              style={styles.wordImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Word with letters */}
          {mode === 'teaching' && teachingStep >= 1 && (
            <TouchableOpacity onPress={handleWordPress} activeOpacity={0.8}>
              <Animated.View style={[styles.wordBox, wordAnimStyle]}>
                <View style={styles.lettersRow}>
                  {letters.map((letter, index) => (
                    <View key={index} style={styles.letterBox}>
                      <Text style={[styles.letter, { color: currentWord.color }]}>
                        {letter}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.fullWord}>{currentWord.word}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Challenge mode - show the word after correct answer */}
          {mode === 'challenge' && selectedAnswer?.word === currentWord.word && (
            <Animated.View style={[styles.wordBox, wordAnimStyle]}>
              <Text style={[styles.revealedWord, { color: currentWord.color }]}>
                {currentWord.word}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Challenge mode options */}
        {mode === 'challenge' && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <AnswerButton
                key={index}
                label={option.word.toUpperCase()}
                onPress={() => handleAnswerPress(option)}
                isSelected={selectedAnswer?.word === option.word}
                isCorrect={selectedAnswer?.word === option.word ? isCorrect : null}
                size="medium"
              />
            ))}
          </View>
        )}

        {/* Tap instruction */}
        {mode === 'teaching' && teachingStep >= 1 && (
          <Text style={styles.tapInstruction}>
            Tap the word to hear it again!
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
          message="Reading star!"
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
    color: '#667eea',
    fontWeight: '600',
    textAlign: 'center',
  },
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  wordImage: {
    width: 130,
    height: 130,
  },
  wordBox: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    alignItems: 'center',
  },
  lettersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  letterBox: {
    width: 60,
    height: 70,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  letter: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  fullWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  revealedWord: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    marginBottom: 30,
    width: '100%',
    flexWrap: 'wrap',
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
