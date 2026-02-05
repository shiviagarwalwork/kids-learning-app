import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnswerButton({
  text,
  label, // Alternative prop name
  onPress,
  state = 'normal', // 'normal', 'correct', 'wrong'
  isSelected = false,
  isCorrect = null,
  disabled = false,
  size = 'medium',
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  // Use label if text is not provided
  const displayText = text || label || '';

  // Determine state from isSelected/isCorrect if state not explicitly set
  let computedState = state;
  if (isSelected && isCorrect === true) {
    computedState = 'correct';
  } else if (isSelected && isCorrect === false) {
    computedState = 'wrong';
  }

  useEffect(() => {
    if (computedState === 'correct') {
      scale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (computedState === 'wrong') {
      shake.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [computedState]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: shake.value },
    ],
  }));

  const getColors = () => {
    switch (computedState) {
      case 'correct':
        return ['#43e97b', '#38f9d7'];
      case 'wrong':
        return ['#ff6b6b', '#c0392b'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const buttonSize = size === 'large' ? styles.large : styles.medium;
  const textSize = size === 'large' ? styles.textLarge : styles.textMedium;

  return (
    <AnimatedTouchable
      style={[styles.container, buttonSize, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isSelected}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={getColors()}
        style={[styles.gradient, buttonSize]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.text, textSize]}>{displayText}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: {
    width: 75,
    height: 65,
    padding: 12,
  },
  large: {
    width: 90,
    height: 80,
    padding: 15,
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  textMedium: {
    fontSize: 24,
  },
  textLarge: {
    fontSize: 32,
  },
});
