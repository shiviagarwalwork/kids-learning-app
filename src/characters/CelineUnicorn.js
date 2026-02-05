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

export default function CelineUnicorn({ size = 180, speaking = false, counting = false }) {
  const float = useSharedValue(0);
  const bounce = useSharedValue(0);
  const tilt = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Gentle floating
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Playful tilt
    tilt.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 1800 }),
        withTiming(-4, { duration: 1800 })
      ),
      -1,
      true
    );

    // Shiny glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1300 }),
        withTiming(0.3, { duration: 1300 })
      ),
      -1,
      true
    );

    if (counting || speaking) {
      bounce.value = withRepeat(
        withSequence(
          withSpring(-12),
          withSpring(0)
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withSpring(1.08),
          withSpring(1)
        ),
        -1,
        true
      );
    }
  }, [counting, speaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: counting || speaking ? bounce.value : float.value },
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
        source={require('../../assets/images/Celine.png')}
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
    shadowColor: '#f5576c',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    backgroundColor: 'transparent',
  },
});
