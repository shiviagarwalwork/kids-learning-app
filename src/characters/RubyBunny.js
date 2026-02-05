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

export default function RubyBunny({ size = 150, speaking = false, hopping = false }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(hopping ? -15 : -5, { duration: hopping ? 300 : 500 }),
        withTiming(0, { duration: hopping ? 300 : 500 })
      ),
      -1,
      true
    );
  }, [hopping]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Left ear */}
        <Ellipse cx="35" cy="15" rx="10" ry="25" fill="#FFB6C1" />
        <Ellipse cx="35" cy="15" rx="5" ry="18" fill="#FFC0CB" />

        {/* Right ear */}
        <Ellipse cx="65" cy="15" rx="10" ry="25" fill="#FFB6C1" />
        <Ellipse cx="65" cy="15" rx="5" ry="18" fill="#FFC0CB" />

        {/* Body */}
        <Ellipse cx="50" cy="72" rx="22" ry="18" fill="#FFB6C1" />
        <Ellipse cx="50" cy="74" rx="14" ry="12" fill="#FFF0F5" />

        {/* Head */}
        <Circle cx="50" cy="45" r="25" fill="#FFB6C1" />

        {/* Cheeks */}
        <Circle cx="32" cy="52" r="6" fill="#FF69B4" opacity="0.5" />
        <Circle cx="68" cy="52" r="6" fill="#FF69B4" opacity="0.5" />

        {/* Eyes */}
        <Circle cx="40" cy="42" r="7" fill="white" />
        <Circle cx="60" cy="42" r="7" fill="white" />
        <Circle cx="42" cy="43" r="4" fill="#4A3728" />
        <Circle cx="62" cy="43" r="4" fill="#4A3728" />
        <Circle cx="43" cy="41" r="1.5" fill="white" />
        <Circle cx="63" cy="41" r="1.5" fill="white" />

        {/* Eyelashes */}
        <Path d="M34 38 L32 35" stroke="#4A3728" strokeWidth="1" />
        <Path d="M36 36 L34 33" stroke="#4A3728" strokeWidth="1" />
        <Path d="M66 38 L68 35" stroke="#4A3728" strokeWidth="1" />
        <Path d="M64 36 L66 33" stroke="#4A3728" strokeWidth="1" />

        {/* Nose */}
        <Ellipse cx="50" cy="52" rx="4" ry="3" fill="#FF69B4" />

        {/* Mouth */}
        <Path
          d={speaking
            ? "M44 56 Q50 64 56 56"
            : "M44 56 Q50 60 56 56"
          }
          stroke="#FF69B4"
          strokeWidth="2"
          fill={speaking ? "#FF9999" : "none"}
        />

        {/* Whiskers */}
        <Path d="M30 50 L18 48" stroke="#FFB6C1" strokeWidth="1.5" />
        <Path d="M30 53 L18 53" stroke="#FFB6C1" strokeWidth="1.5" />
        <Path d="M30 56 L18 58" stroke="#FFB6C1" strokeWidth="1.5" />
        <Path d="M70 50 L82 48" stroke="#FFB6C1" strokeWidth="1.5" />
        <Path d="M70 53 L82 53" stroke="#FFB6C1" strokeWidth="1.5" />
        <Path d="M70 56 L82 58" stroke="#FFB6C1" strokeWidth="1.5" />

        {/* Bow */}
        <Circle cx="75" cy="25" r="4" fill="#FF1493" />
        <Ellipse cx="70" cy="22" rx="6" ry="4" fill="#FF1493" />
        <Ellipse cx="80" cy="22" rx="6" ry="4" fill="#FF1493" />

        {/* Feet */}
        <Ellipse cx="38" cy="90" rx="10" ry="6" fill="#FFB6C1" />
        <Ellipse cx="62" cy="90" rx="10" ry="6" fill="#FFB6C1" />

        {/* Tail (fluffy ball) */}
        <Circle cx="50" cy="88" r="8" fill="white" />
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
