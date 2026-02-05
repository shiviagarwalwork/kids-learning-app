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

export const DOG_NAME = 'Max';

export default function DogFriend({ size = 100, showName = false, onPress }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(`Woof! I'm Max the Dog!`);
    if (onPress) onPress();
  };
  const wag = useSharedValue(0);
  const bounce = useSharedValue(0);
  const glow = useSharedValue(0.2);

  useEffect(() => {
    // Excited tail wag animation
    wag.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 150 }),
        withTiming(-10, { duration: 150 })
      ),
      -1,
      true
    );

    // Happy bouncing
    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );

    // Shiny glow
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1200 }),
        withTiming(0.2, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${wag.value}deg` },
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
              <Text style={styles.name}>{DOG_NAME}</Text>
              <View style={styles.cloudArrow} />
            </View>
          )}
          <AnimatedImage
            source={require('../../assets/images/dog.png')}
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
    shadowColor: '#FFD700',
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
    color: '#FFB347',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
