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
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Rect, Polygon, Ellipse, Path } from 'react-native-svg';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { speak, stopSpeech } from '../utils/speech';
import { DogFriend } from '../characters';
import GameHeader from '../components/GameHeader';
import CelebrationOverlay from '../components/CelebrationOverlay';

const { width } = Dimensions.get('window');

// Shape definitions
const SHAPES = [
  { name: 'circle', displayName: 'Circle', color: '#FF6B6B' },
  { name: 'square', displayName: 'Square', color: '#4ECDC4' },
  { name: 'triangle', displayName: 'Triangle', color: '#FFE66D' },
  { name: 'rectangle', displayName: 'Rectangle', color: '#95E1D3' },
  { name: 'star', displayName: 'Star', color: '#DDA0DD' },
  { name: 'heart', displayName: 'Heart', color: '#FF69B4' },
  { name: 'oval', displayName: 'Oval', color: '#87CEEB' },
  { name: 'diamond', displayName: 'Diamond', color: '#98D8C8' },
];

// Shape component
function Shape({ name, size = 80, color }) {
  const shapeSize = size * 0.8;

  switch (name) {
    case 'circle':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill={color} />
        </Svg>
      );
    case 'square':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Rect x="10" y="10" width="80" height="80" fill={color} />
        </Svg>
      );
    case 'triangle':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Polygon points="50,10 90,90 10,90" fill={color} />
        </Svg>
      );
    case 'rectangle':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Rect x="5" y="25" width="90" height="50" fill={color} />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Polygon
            points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
            fill={color}
          />
        </Svg>
      );
    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Path
            d="M50,88 C20,60 5,40 15,25 C25,10 40,15 50,30 C60,15 75,10 85,25 C95,40 80,60 50,88"
            fill={color}
          />
        </Svg>
      );
    case 'oval':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx="50" cy="50" rx="45" ry="30" fill={color} />
        </Svg>
      );
    case 'diamond':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Polygon points="50,5 95,50 50,95 5,50" fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}

// Animated shape option
function ShapeOption({ shape, onPress, isWrong, delay }) {
  const scale = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 8 });
    }, delay);
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
    <Animated.View style={[styles.shapeOption, animatedStyle]}>
      <TouchableOpacity
        onPress={() => onPress(shape.name)}
        activeOpacity={0.8}
        style={styles.shapeButton}
      >
        <View style={styles.shapeContainer}>
          <Shape name={shape.name} size={90} color={shape.color} />
        </View>
        <Text style={styles.shapeName}>{shape.displayName}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ShapesGame() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { addStars, addScore } = useGame();

  const [targetShape, setTargetShape] = useState(null);
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
    // Pick random target shape
    const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setTargetShape(target);
    setWrongAnswer(null);

    // Pick 3 other random shapes for options
    const otherShapes = SHAPES.filter(s => s.name !== target.name);
    const shuffled = otherShapes.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    // Add target and shuffle all options
    const allOptions = [...selected, target].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    setMessage(`Find the ${target.displayName}!`);

    // Speak instruction
    timeoutRef.current = setTimeout(() => {
      speak(`Find the ${target.displayName}!`);
    }, 500);
  };

  const handleShapePress = (shapeName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (shapeName === targetShape.name) {
      // Correct!
      characterScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );

      const newScore = score + 1;
      setScore(newScore);
      addScore(10);

      speak(`Yes! That's a ${targetShape.displayName}! Great job!`);
      setMessage(`Great! That's a ${targetShape.displayName}!`);

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
      setWrongAnswer(shapeName);
      const wrongShape = SHAPES.find(s => s.name === shapeName);
      speak(`That's a ${wrongShape.displayName}. Find the ${targetShape.displayName}!`);
      setMessage(`That's a ${wrongShape.displayName}. Find the ${targetShape.displayName}!`);

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
      colors={['#f5af19', '#f12711', '#f5af19']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <GameHeader
          title="Shapes"
          score={score}
          onBack={() => navigate('Home')}
          color="#f12711"
        />

        {/* Character and instruction */}
        <Animated.View style={[styles.characterContainer, characterAnimStyle]}>
          <DogFriend size={100} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{message || 'Find the shape!'}</Text>
          </View>
        </Animated.View>

        {/* Target shape display */}
        {targetShape && (
          <View style={styles.targetContainer}>
            <Text style={styles.targetLabel}>Find:</Text>
            <View style={styles.targetShape}>
              <Shape name={targetShape.name} size={100} color={targetShape.color} />
            </View>
            <Text style={styles.targetName}>{targetShape.displayName}</Text>
          </View>
        )}

        {/* Shape options grid */}
        <View style={styles.optionsGrid}>
          {options.map((shape, index) => (
            <ShapeOption
              key={shape.name}
              shape={shape}
              onPress={handleShapePress}
              isWrong={wrongAnswer === shape.name}
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
          message="Shape master!"
          character={DogFriend}
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
    color: '#f12711',
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
  targetShape: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  targetName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 20,
  },
  shapeOption: {
    width: (width - 70) / 2,
    alignItems: 'center',
  },
  shapeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 15,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  shapeContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
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
