import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function NikolaUnicorn({ size = 180, speaking = false, teaching = false }) {
  const float = useSharedValue(0);
  const tilt = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Floating animation
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shiny glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );

    // Playful tilt always on
    tilt.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1600 }),
        withTiming(-5, { duration: 1600 })
      ),
      -1,
      true
    );

    if (teaching || speaking) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.1),
          withSpring(1)
        ),
        -1,
        true
      );
    }
  }, [teaching, speaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value },
      { rotate: `${tilt.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <AnimatedView style={[styles.glowContainer, glowStyle]}>
      <AnimatedImage
        source={require('../../assets/images/Nikola.png')}
        style={[
          styles.image,
          { width: size, height: size },
          animatedStyle,
        ]}
        resizeMode="contain"
      />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    backgroundColor: 'transparent',
  },
});
