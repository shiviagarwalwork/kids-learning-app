import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speak } from '../utils/speech';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GameButton({
  title,
  subtitle,
  colors,
  icon,
  character: Character,
  onPress,
  speakText, // Text to speak when button is pressed
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Speak the game name so kids know what they're selecting
    // Wait for speech to finish before navigating
    if (speakText) {
      await speak(speakText);
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        {Character && (
          <View style={styles.characterContainer}>
            <Character size={110} />
          </View>
        )}
        {icon && !Character && (
          <Text style={styles.icon}>{icon}</Text>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    overflow: 'visible',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 25,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -20,
    left: -20,
  },
  textContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  characterContainer: {
    marginTop: 5,
    zIndex: 1,
  },
  icon: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
