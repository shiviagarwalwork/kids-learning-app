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

export default function MelodyUnicorn({ size = 180, speaking = false, dancing = false }) {
  const float = useSharedValue(0);
  const sway = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Bouncy floating
    float.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shiny glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1200 }),
        withTiming(0.3, { duration: 1200 })
      ),
      -1,
      true
    );

    // Always a little sway
    sway.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 1400 }),
        withTiming(-4, { duration: 1400 })
      ),
      -1,
      true
    );

    if (dancing || speaking) {
      sway.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 250 }),
          withTiming(-8, { duration: 250 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withSpring(1.1),
          withSpring(1)
        ),
        -1,
        true
      );
    }
  }, [dancing, speaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value },
      { rotate: `${sway.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <AnimatedView style={[styles.glowContainer, glowStyle]}>
      <AnimatedImage
        source={require('../../assets/images/Melody.png')}
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
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    backgroundColor: 'transparent',
  },
});
