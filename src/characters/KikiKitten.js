import React, { useEffect } from 'react';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function KikiKitten({ size = 150, speaking = false, playful = false }) {
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      true
    );

    if (playful) {
      rotate.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 300 }),
          withTiming(-5, { duration: 300 })
        ),
        -1,
        true
      );
    }
  }, [playful]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Tail */}
        <Path
          d="M20 70 Q5 50 15 35 Q20 40 18 50"
          stroke="#FFA726"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M15 35 Q20 30 18 38"
          fill="#FFA726"
        />

        {/* Body */}
        <Ellipse cx="50" cy="70" rx="25" ry="20" fill="#FFA726" />
        <Ellipse cx="50" cy="72" rx="16" ry="14" fill="#FFE0B2" />

        {/* Head */}
        <Circle cx="50" cy="40" r="28" fill="#FFA726" />

        {/* Left ear */}
        <Path d="M25 25 L20 5 L40 20 Z" fill="#FFA726" />
        <Path d="M27 22 L24 10 L36 20 Z" fill="#FFB74D" />

        {/* Right ear */}
        <Path d="M75 25 L80 5 L60 20 Z" fill="#FFA726" />
        <Path d="M73 22 L76 10 L64 20 Z" fill="#FFB74D" />

        {/* Face markings */}
        <Path d="M50 25 L45 35 L50 32 L55 35 Z" fill="#FFE0B2" />

        {/* Eyes */}
        <Ellipse cx="38" cy="38" rx="9" ry="10" fill="white" />
        <Ellipse cx="62" cy="38" rx="9" ry="10" fill="white" />
        <Circle cx="40" cy="40" r="5" fill="#4CAF50" />
        <Circle cx="64" cy="40" r="5" fill="#4CAF50" />
        <Circle cx="38" cy="38" r="3" fill="#1B5E20" />
        <Circle cx="62" cy="38" r="3" fill="#1B5E20" />
        <Circle cx="39" cy="36" r="2" fill="white" />
        <Circle cx="63" cy="36" r="2" fill="white" />

        {/* Nose */}
        <Path d="M47 50 L50 54 L53 50 Z" fill="#FF7043" />

        {/* Mouth */}
        <Path
          d={speaking
            ? "M44 56 Q50 65 56 56"
            : "M44 56 Q47 58 50 55 Q53 58 56 56"
          }
          stroke="#5D4037"
          strokeWidth="2"
          fill={speaking ? "#FFAB91" : "none"}
        />

        {/* Whiskers */}
        <G stroke="#5D4037" strokeWidth="1.5">
          <Path d="M28 48 L12 45" />
          <Path d="M28 52 L12 52" />
          <Path d="M28 56 L12 59" />
          <Path d="M72 48 L88 45" />
          <Path d="M72 52 L88 52" />
          <Path d="M72 56 L88 59" />
        </G>

        {/* Cheek blush */}
        <Circle cx="28" cy="50" r="5" fill="#FFAB91" opacity="0.6" />
        <Circle cx="72" cy="50" r="5" fill="#FFAB91" opacity="0.6" />

        {/* Collar */}
        <Path
          d="M32 62 Q50 68 68 62"
          stroke="#E91E63"
          strokeWidth="4"
          fill="none"
        />
        <Circle cx="50" cy="65" r="4" fill="#FFC107" />

        {/* Paws */}
        <Ellipse cx="35" cy="88" rx="9" ry="6" fill="#FFA726" />
        <Ellipse cx="65" cy="88" rx="9" ry="6" fill="#FFA726" />

        {/* Paw pads */}
        <Circle cx="33" cy="89" r="2" fill="#FFAB91" />
        <Circle cx="37" cy="89" r="2" fill="#FFAB91" />
        <Circle cx="63" cy="89" r="2" fill="#FFAB91" />
        <Circle cx="67" cy="89" r="2" fill="#FFAB91" />

        {/* Playful sparkles */}
        {playful && (
          <G fill="#FFD700">
            <Path d="M85 20 L87 25 L92 25 L88 28 L90 33 L85 30 L80 33 L82 28 L78 25 L83 25 Z" />
            <Path d="M15 60 L16 63 L19 63 L17 65 L18 68 L15 66 L12 68 L13 65 L11 63 L14 63 Z" />
          </G>
        )}
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
