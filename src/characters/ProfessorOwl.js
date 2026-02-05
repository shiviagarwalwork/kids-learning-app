import React, { useEffect } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProfessorOwl({ size = 150, speaking = false, thinking = false }) {
  const tilt = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    // Gentle tilting
    tilt.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 1500 }),
        withTiming(-3, { duration: 1500 })
      ),
      -1,
      true
    );

    // Occasional blink
    blink.value = withRepeat(
      withDelay(
        3000,
        withSequence(
          withTiming(0.1, { duration: 100 }),
          withTiming(1, { duration: 100 })
        )
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt.value}deg` }],
  }));

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Body */}
        <Ellipse cx="50" cy="70" rx="28" ry="25" fill="#8B6914" />
        <Ellipse cx="50" cy="72" rx="20" ry="18" fill="#D2B48C" />

        {/* Belly pattern */}
        <Path
          d="M35 65 Q50 85 65 65"
          fill="#F5DEB3"
        />

        {/* Wings */}
        <Ellipse cx="22" cy="65" rx="12" ry="20" fill="#6B4226" />
        <Ellipse cx="78" cy="65" rx="12" ry="20" fill="#6B4226" />

        {/* Head */}
        <Circle cx="50" cy="35" r="28" fill="#8B6914" />

        {/* Ear tufts */}
        <Path d="M28 15 L22 5 L35 18" fill="#6B4226" />
        <Path d="M72 15 L78 5 L65 18" fill="#6B4226" />

        {/* Face disc */}
        <Circle cx="50" cy="38" r="22" fill="#F5DEB3" />

        {/* Eye circles */}
        <Circle cx="40" cy="35" r="12" fill="white" stroke="#6B4226" strokeWidth="2" />
        <Circle cx="60" cy="35" r="12" fill="white" stroke="#6B4226" strokeWidth="2" />

        {/* Eyes */}
        <Circle cx="40" cy="35" r="7" fill="#4A3728" />
        <Circle cx="60" cy="35" r="7" fill="#4A3728" />
        <Circle cx="42" cy="33" r="2.5" fill="white" />
        <Circle cx="62" cy="33" r="2.5" fill="white" />

        {/* Beak */}
        <Path
          d="M45 45 L50 55 L55 45 Z"
          fill="#FF8C00"
        />

        {/* Glasses */}
        <Circle cx="40" cy="35" r="14" fill="none" stroke="#4A3728" strokeWidth="2" />
        <Circle cx="60" cy="35" r="14" fill="none" stroke="#4A3728" strokeWidth="2" />
        <Path d="M54 35 L46 35" stroke="#4A3728" strokeWidth="2" />
        <Path d="M26 33 L20 30" stroke="#4A3728" strokeWidth="2" />
        <Path d="M74 33 L80 30" stroke="#4A3728" strokeWidth="2" />

        {/* Graduation cap */}
        <Rect x="30" y="5" width="40" height="5" fill="#1a1a1a" />
        <Path d="M25 10 L50 0 L75 10 L50 15 Z" fill="#1a1a1a" />
        <Path d="M65 10 L65 20" stroke="#FFD700" strokeWidth="2" />
        <Circle cx="65" cy="22" r="3" fill="#FFD700" />

        {/* Feet */}
        <Path d="M38 92 L35 98 M40 92 L40 98 M42 92 L45 98" stroke="#FF8C00" strokeWidth="3" />
        <Path d="M58 92 L55 98 M60 92 L60 98 M62 92 L65 98" stroke="#FF8C00" strokeWidth="3" />

        {/* Speech indicator */}
        {speaking && (
          <Circle cx="80" cy="50" r="8" fill="#FFD700" opacity="0.8" />
        )}

        {/* Thinking bubble */}
        {thinking && (
          <>
            <Circle cx="85" cy="25" r="4" fill="white" opacity="0.8" />
            <Circle cx="90" cy="18" r="3" fill="white" opacity="0.8" />
            <Circle cx="93" cy="12" r="2" fill="white" opacity="0.8" />
          </>
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
