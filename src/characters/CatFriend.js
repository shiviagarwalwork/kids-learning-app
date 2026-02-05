import React, { useEffect } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speak } from '../utils/speech';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);

export const CAT_NAME = 'Whiskers';

export default function CatFriend({ size = 100, showName = false, onPress }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(`Meow! I'm Whiskers the Cat!`);
    if (onPress) onPress();
  };
  const sway = useSharedValue(0);
  const float = useSharedValue(0);
  const glow = useSharedValue(0.2);

  useEffect(() => {
    // Playful sway
    sway.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 500 }),
        withTiming(-8, { duration: 500 })
      ),
      -1,
      true
    );

    // Gentle float
    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shiny glow
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1100 }),
        withTiming(0.2, { duration: 1100 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value },
      { rotate: `${sway.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.container}>
        <AnimatedView style={[styles.glowContainer, glowStyle]}>
          {showName && (
            <View style={styles.cloudContainer}>
              <Text style={styles.name}>{CAT_NAME}</Text>
              <View style={styles.cloudArrow} />
            </View>
          )}
          <AnimatedImage
            source={require('../../assets/images/cat.png')}
            style={[
              styles.image,
              { width: size, height: size },
              animatedStyle,
            ]}
            resizeMode="contain"
          />
        </AnimatedView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  glowContainer: {
    position: 'relative',
    alignItems: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  cloudContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'absolute',
    top: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
    alignItems: 'center',
  },
  cloudArrow: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  image: {
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
