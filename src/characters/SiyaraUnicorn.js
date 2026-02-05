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

export default function SiyaraUnicorn({ size = 180, speaking = false, sparkle = true }) {
  const float = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Gentle floating animation
    float.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shiny glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1400 }),
        withTiming(0.3, { duration: 1400 })
      ),
      -1,
      true
    );

    // Subtle rotation for liveliness
    rotate.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 2000 }),
        withTiming(-4, { duration: 2000 })
      ),
      -1,
      true
    );

    if (speaking) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.1),
          withSpring(1)
        ),
        -1,
        true
      );
    }
  }, [speaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <AnimatedView style={[styles.glowContainer, glowStyle]}>
      <AnimatedImage
        source={require('../../assets/images/Siyara.png')}
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
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    elevation: 10,
  },
  image: {
    backgroundColor: 'transparent',
  },
});
