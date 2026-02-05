import React, { useEffect } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speak } from '../utils/speech';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);

export const BUNNY_NAME = 'Bella';

export default function BunnyFriend({ size = 100, showName = false, onPress }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(`Hi! I'm Bella the Bunny!`);
    if (onPress) onPress();
  };
  const hop = useSharedValue(0);
  const tilt = useSharedValue(0);
  const glow = useSharedValue(0.2);

  useEffect(() => {
    // Hopping animation
    hop.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 350, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 350, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );

    // Cute tilt
    tilt.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 700 }),
        withTiming(-6, { duration: 700 })
      ),
      -1,
      true
    );

    // Shiny glow
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hop.value },
      { rotate: `${tilt.value}deg` },
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
              <Text style={styles.name}>{BUNNY_NAME}</Text>
              <View style={styles.cloudArrow} />
            </View>
          )}
          <AnimatedImage
            source={require('../../assets/images/Bunny.png')}
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
    shadowColor: '#FFB6C1',
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
    color: '#FF69B4',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
